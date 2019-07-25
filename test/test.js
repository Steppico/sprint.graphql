const chai = require("chai");

const expect = chai.expect;
const url = `http://localhost:4000`;
const request = require("supertest")(url);

describe("GraphQL", () => {
  it("should be OK", (done) => {
    request
      .post("/graphql")
      .send({ query: `{Pokemons{name}}` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
  it("should return all the pokemons", (done) => {
    const cool = request
      .post("/graphql")
      .send({ query: `{Pokemons{name}}` })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        res;
      });
  });
});
