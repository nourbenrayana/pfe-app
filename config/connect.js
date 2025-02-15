const { DocumentStore } = require("ravendb");

const store = new DocumentStore("https://a.nour.ravendb.community/", "BD");

store.initialize();

console.log("Connected to RavenDB!");
