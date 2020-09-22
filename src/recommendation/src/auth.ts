import { AuthChecker } from 'type-graphql';
import { Context } from './context';

// create auth checker function
export const authChecker: AuthChecker<Context> = async ({
  context: { req, user },
}) => {
  return !!user;
};
