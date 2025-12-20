// lib/graphql/queries.js

// 修正版: functions.phpで作ったカスタム検索を使う
export const GET_USER_ID_BY_STRIPE_CUSTOMER = `
  query GetUserByStripeID($stripeCustomerId: String!) {
    user: userByStripeData(stripeId: $stripeCustomerId) {
      databaseId
    }
  }
`;
