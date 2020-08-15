const {Strategy, ExtractJwt} = require('passport-jwt');
const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET || 'JWT_TOKEN_SECRET';

module.exports = {
    /**
     * Creates a new jwt token strategy to authenticate requests
     * @returns {Strategy}
     */
    initialize() {
        return new Strategy({
            secretOrKey: JWT_TOKEN_SECRET,
            jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token')
        }, function(token, done) {
            try {
                //Pass the user details to the next middleware
                return done(null, token.user);
            } catch (error) {
                done(error);
            } 
        });

        
    }
}