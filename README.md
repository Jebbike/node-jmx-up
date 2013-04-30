# node-jmx

node.js library to communicate with java applications through JMX.

## Usage

### Examples

```js
var jmx = require("jmx");

client = jmx.createClient({
  host: "localhost", // optional
  port: 3000
});

client.connect(function() {
  client.read("java.lang:type=Memory", "HeapMemoryUsage", function(data) {
    console.log(data.toString());
  });

  client.write("java.lang:type=Memory", "Verbose", true, function(data) {
    console.log("Memory verbose on"); // callback is optional
  });

  client.invoke("java.lang:type=Memory", "gc", [], function(data) {
    console.log("gc() done");
  });
});
```

```js
client = jmx.createClient({
  service: "service:jmx:rmi:///jndi/rmi://localhost:3000/jmxrmi",
});
```

## License and Author

|                      |                                          |
|:---------------------|:-----------------------------------------|
| **Author:**          | Xabier de Zuazo (<xabier@onddo.com>)
| **Copyright:**       | Copyright (c) 2013 Onddo Labs, SL.
| **License:**         | Apache License, Version 2.0

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

