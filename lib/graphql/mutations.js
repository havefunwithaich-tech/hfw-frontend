// lib/graphql/mutations.js

export const UPDATE_USER_DATA = `
  mutation UpdateUserData($id: ID!, $stripeCustomerId: String!, $subscriptionStatus: String!) {
    updateStripeData(input: {
      userId: $id,
      stripeId: $stripeCustomerId,
      status: $subscriptionStatus
    }) {
      success
    }
  }
`;

// 修正箇所: myStripeId -> stripeCustomerId
export const LOGIN_MUTATION = `
  mutation Login($username: String!, $password: String!) {
    login(input: {
      clientMutationId: "uniqueId",
      username: $username,
      password: $password
    }) {
      authToken
      user {
        databaseId
        name
        email
        stripeCustomerId
      }
    }
  }
`;
