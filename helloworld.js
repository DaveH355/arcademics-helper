var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
var today = new Date()

console.log("Hello " + "world")
console.log(today.toLocaleDateString("en-US", options));