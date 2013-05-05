var assert = require("assert"),
    chmod = require("fs").chmod,
    jmx = require("./../index.js"),
    StartJmxApp = require("./integration/startJmxApp.js");

var jmxPort = 63120;

describe("Integration tests", function() {
  this.timeout(5000);
  before(function(done) {
    chmod(__dirname + "/integration/jmxremote.password", 0400, function(err) {
      if (err) {
        console.error(err);
      }
      done();
    });
  });

  it("should run java JMX test app", function(done) {
    var jmxApp = new StartJmxApp(jmxPort, null, function() {
      jmxApp.stop(function() {
        done();
      });
    });
  });

  describe("client", function() {
    var jmxApp;
    before(function(done) {
      jmxApp = new StartJmxApp(jmxPort, null, function() {
        done();
      });
    });
    after(function(done) {
      jmxApp.stop(function() {
        done();
      });
    });

    it("should connect succefully", function(done) {
      client = jmx.createClient({
        host: '127.0.0.1',
        port: jmxPort
      });
      client.connect();
      client.on("connect", function() {
        done();
      });
    });

    it("should not connect when the port is wrong", function(done) {
      this.timeout(20000);
      client = jmx.createClient({
        host: '127.0.0.1',
        port: jmxPort + 1
      });
      client.connect();
      client.on("error", function(err) {
        if (/java\.(net\.ConnectException|rmi\.ConnectIOException)/.test(err)) {
          done();
        } else {
          console.error(err);
        }
      });
    });

    describe("when it is connected", function() {
      var client;
      before(function(done) {
        client = jmx.createClient({
          host: '127.0.0.1',
          port: jmxPort
        });
        client.connect();
        client.on("connect", done);
      });
      after(function() {
        client.disconnect();
      });

      it("#getAttribute", function(done) {
        client.getAttribute("java.lang:type=Memory", "HeapMemoryUsage", function(value) {
          assert.ok(typeof value === "object" && value.get && value.getSync);
          done();
        });
      });

      it("#getDefaultDomain", function(done) {
        client.getDefaultDomain(function(value) {
          assert.ok(typeof value === "string");
          done();
        });
      });

      it("#getDomains", function(done) {
        client.getDomains(function(value) {
          assert.ok(value instanceof Array && value.length > 0);
          done();
        });
      });

      it("#getMBeanCount", function(done) {
        client.getMBeanCount(function(value) {
          assert.ok(typeof value === "number" && value > 0);
          done();
        });
      });

      it("#invoke", function(done) {
        client.invoke("java.lang:type=Memory", "gc", [], function(data) {
          done();
        });
      });

      it("#setAttribute", function(done) {
        var domain = "java.lang:type=Memory";
        var attribute = "Verbose";
        var values = [ true, false ];
        client.setAttribute(domain, attribute, values[0], function() {
          client.getAttribute(domain, attribute, function(data) {
            assert.strictEqual(data, values[0]);
            client.setAttribute(domain, attribute, values[1], function() {
              client.getAttribute(domain, attribute, function(data) {
                assert.strictEqual(data, values[1]);
                done();
              });
            });
          })
        });
      });

    });

  });

  it("should run java JMX test app with authentication enabled", function(done) {
    var jmxApp = new StartJmxApp(jmxPort, "jmxremote.password", function() {
      jmxApp.stop(function() {
        done();
      });
    });
  });

  describe("starting a server with authentication", function() {
    var jmxApp;
    before(function(done) {
      jmxApp = new StartJmxApp(jmxPort, "jmxremote.password", function() {
        done();
      });
    });
    after(function(done) {
      jmxApp.stop(function() {
        done();
      });
    });

    it("should not connect succefully without credentials", function(done) {
      client = jmx.createClient({
        host: '127.0.0.1',
        port: jmxPort
      });
      client.emit = function(ev, data) {
        if (ev === "error") {
          if (/java\.lang\.SecurityException/.test(data)) {
            done();
          } else {
            console.error(data);
          }
        }
      };
      client.connect();
      client.on("connect", function() {
        assert(false, "connect");
      });
    });

    it("should connect succefully with the correct credentials", function(done) {
      client = jmx.createClient({
        host: '127.0.0.1',
        port: jmxPort,
        username: "controlRole",
        password: "testPassword"
      });
      client.connect();
      client.on("connect", function() {
        done();
      });
    });

  });

});
