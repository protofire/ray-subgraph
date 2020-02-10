## Robo-Advisor for Yield Subgraph

The subgraph generated by this code can be found at the [protofire/ray](https://thegraph.com/explorer/subgraph/protofire/ray) subgraph in the TheGraph explorer.

The [schema](schema.graphql) defines all entities to be exposed in the subgraph, as well as any relations between the data entities, and all entity fields that can be queried on the subgraph.

#### Query examples

We can query anything in the same way we would query a GraphQL backend, for more documentation on that visit the [official GraphQL docs](https://graphql.org/learn/queries/). Below are some of queries we might be interested in using.

###### Assets
Get all supported assets with its' name, address, symbol and decimals

```graphql
assets {
  name
  address
  symbol
  decimals
}
```

###### Users

Get all end users with its' respective address, and the value and status of their tokens

```graphql
users {
  id
  address
  token {
    value
    isActive
  }
}
```

###### Opportunities

Get all opportunities, with its' related portfolio and token

```graphql
opportunities {
  id
  address
  portfolio {
    id
    asset {
      address
      name
    }
  }
  token {
    id
  }
}
```

###### Portfolios

Get all portfolios with its' asset, opportunities and associated raytokens

```graphql
portfolios {
  asset {
    symbol
    name
  }
  opportunities {
    id
    address
    token {
      id
    }
  }
  raytokens {
    id
  }
}
```

###### RAYTokens

Get all RAYTokens with its' corresponding owner address, portfolio, asset, value and all its' events.

```graphql
raytokens {
  owner {
    address
  }
  portfolio {
    asset {
      address
      name
    }
  }
  value
  events {
    __typename
    value
  }
}
```

###### Token Events

Get all events with basically all of their data. Here we can use inline fragments to query more effectively the different types of events.

```graphql
raytokenEvents {
  token {
    id
  }
  value
  timestamp
  block
  transaction
  __typename
  ... on MintEvent {
    minter
  }
  ... on DepositEvent {
    sender
    tokenValueBefore
    tokenValueAfter
  }
  ... on WithdrawEvent {
    tokenValueBefore
    tokenValueAfter
  }
}
```