const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
// The data below is mocked.
const data = require("./data");

// The schema should model the full data object available.
const schema = buildSchema(`
  type Pokemon {
    id: String
    name: String!
    classification: String
    types: [String]
    resistant: [String]
    weaknesses: [String]
    weight: WeightHeight
    height: WeightHeight
    fleeRate: Float
    evolutionRequirements: EvoReq
    evolutions: [Evol]
    maxCP: Int
    maxHP: Int
    attacks: Attacks
  }
  type Attacks {
    fast: [Attack]
    special: [Attack]
  }
  type Attack {
    name: String
    type: String
    damage: Int
  }

  type Evol {
    id: Int
    name: String
  }
  type EvoReq {
    amount: Int
    name: String
  }
  type WeightHeight {
    minimum: String
    maximum: String
  }

  type Query {
    Pokemons: [Pokemon]
    PokeType(type: String!): [Pokemon]
    Pokettack(name: String!): [Pokemon]
    Pokemon(name: String, id: String): Pokemon
    Attacks(type: String!): [Attack]
    Types: [String]
  }

  type Mutation {
    addPokemon(input: PokeInput): Pokemon
    editPokemon(name: String!, input: PokeInput): Pokemon
    deletePokemon(name: String!): Pokemon
    addType(input: String!): [String]
    editType(name: String!, input: String!): [String]
    deleteType(name: String!): [String]
    addAttack(type: String!, input: Atk) : [Attack]
    editAttack(name: String!, input: Atk): Attack
    deleteAttack(input: String!): Attack
  }
  
  input PokeInput {
    id: String
    name: String!
    classification: String
    types: [String]
    resistant: [String]
    weaknesses: [String]
    weight: WH
    height: WH
    fleeRate: Float
    evolutionRequirements: EvoR
    evolutions: [Evo]
    maxCP: Int
    maxHP: Int
    attacks: Atks
  }
  input WH {
    minimum: String
    maximum: String
  }
  input EvoR {
    amount: Int
    name: String
  }
  input Evo {
    id: Int
    name: String
  }
  input Atks {
    fast: [Atk]
    special: [Atk]
  }
  input Atk {
    name: String
    type: String
    damage: Int
  }
`);

// The root provides the resolver functions for each type of query or mutation.
const root = {
  addPokemon: (input) => {
    data.pokemon.push(input.input);
    return input.input;
  },
  editPokemon: (input) => {
    const caught = data.pokemon.find((pokemon) => pokemon.name === input.name);
    for (const key in input.input) {
      caught[key] = input.input[key];
    }
    return caught;
  },
  deletePokemon: (input) => {
    const caught = data.pokemon.find((pokemon) => pokemon.name === input.name);
    const index = data.pokemon.indexOf(caught);
    data.pokemon.splice(index, 1);
    return caught;
  },
  Pokemons: () => {
    return data.pokemon;
  },
  Pokemon: (request) => {
    const nameOrId = request.name ? "name" : "id";
    return data.pokemon.find(
      (pokemon) => pokemon[nameOrId] === request[nameOrId]
    );
  },
  Attacks: (request) => {
    return data.attacks[request.type];
  },
  addAttack: (input) => {
    data.attacks[input.type].push(input.input);
    return data.attacks[input.type];
  },
  editAttack: (input) => {
    const allAttacks = data.attacks.fast.concat(data.attacks.special);
    for (const key of allAttacks) {
      if (key.name === input.name) {
        Object.assign(key, input.input);
      }
    }
    return input.input;
  },

  deleteAttack: (input) => {
    const attack = data.attacks.fast
      .concat(data.attacks.special)
      .find((attack) => {
        return attack.name === input.input;
      });
    if (data.attacks.fast.includes(attack)) {
      const index = data.attacks.fast.indexOf(attack);
      data.attacks.fast.splice(index, 1);
    } else {
      const index = data.attacks.special.indexOf(attack);
      data.attacks.special.splice(index, 1);
    }
    return attack;
  },

  Types: () => {
    return data.types;
  },
  addType: (input) => {
    data.types.push(input.input);
    return data.types;
  },
  editType: (input) => {
    const index = data.types.indexOf(input.name);
    data.types.splice(index, 1, input.input);
    return data.types;
  },
  deleteType: (input) => {
    const index = data.types.indexOf(input.name);
    data.types.splice(index, 1);
    return data.types;
  },
  PokeType: (request) => {
    return data.pokemon.filter((pokemon) => {
      for (const type of pokemon.types) {
        if (type === request.type) {
          return true;
        }
        return false;
      }
    });
  },
  Pokettack: (request) => {
    return data.pokemon.filter((pokemon) => {
      const allAttacks = pokemon.attacks.fast.concat(pokemon.attacks.special);
      for (const attack of allAttacks) {
        if (attack.name === request.name) {
          return true;
        }
      }
      return false;
    });
  },
};

// Start your express server!
const app = express();

/*
  The only endpoint for your server is `/graphql`- if you are fetching a resource, 
  you will need to POST your query to that endpoint. Suggestion: check out Apollo-Fetch
  or Apollo-Client. Note below where the schema and resolvers are connected. Setting graphiql
  to 'true' gives you an in-browser explorer to test your queries.
*/
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Running a GraphQL API server at localhost:${PORT}/graphql`);
});
