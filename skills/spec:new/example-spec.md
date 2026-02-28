---
name: User Authentication via OAuth2
description: Enable users to authenticate using Google and GitHub OAuth2 providers
metadata:
  created_date: 2026-02-28
  last_updated: 2026-02-28
  author: Engineering Team
  status: draft
---

# User Authentication via OAuth2

## Summary
This spec defines the implementation of OAuth2-based authentication for our application, allowing users to sign in using their Google or GitHub accounts. This eliminates the need for password management and reduces friction in the signup process, while improving security through trusted third-party authentication providers.

## Goals
- Enable users to sign up and log in using Google OAuth2
- Enable users to sign up and log in using GitHub OAuth2  
- Store essential user profile information (email, name, avatar URL) from OAuth providers
- Maintain secure session management with proper token handling
- Provide a seamless authentication experience with < 3 second flow completion

## Non-goals
- Single Sign-On (SSO) for enterprise accounts - will be addressed in future spec
- Multi-factor authentication (MFA) - deferred to Q2 2026
- Account linking (connecting multiple OAuth providers to one account) - future enhancement
- Custom username/password authentication - we're moving away from this model
- Social features using OAuth provider data (friends, followers, etc.)

## Requirements

### Functional Requirements
- FR1: System must support login via Google OAuth2 with authorization code flow
- FR2: System must support login via GitHub OAuth2 with authorization code flow
- FR3: System must capture and store user email, display name, and avatar URL from OAuth provider
- FR4: System must create a new user account on first OAuth login
- FR5: System must maintain user sessions with secure, HTTP-only cookies
- FR6: System must provide logout functionality that clears sessions and revokes tokens
- FR7: System must display clear error messages for failed authentication attempts
- FR8: System must redirect users to their intended destination after successful login

### Non-functional Requirements
- NFR1: OAuth authentication flow must complete within 3 seconds (95th percentile)
- NFR2: Access tokens must be encrypted at rest using AES-256
- NFR3: Session tokens must expire after 30 days of inactivity
- NFR4: System must support 1000 concurrent authentication requests
- NFR5: All authentication events must be logged for security audit
- NFR6: OAuth redirect URIs must use HTTPS in production
- NFR7: Implementation must comply with OAuth2 RFC 6749 standard

## Dependencies
- Google OAuth2 API (https://developers.google.com/identity/protocols/oauth2)
- GitHub OAuth2 API (https://docs.github.com/en/apps/oauth-apps)
- PostgreSQL database for user account storage
- Redis for session storage and caching
- Express.js middleware for request handling
- Environment variables for OAuth client credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET)

## Proposed Approach

### Options

**Option 1: Use Passport.js with OAuth strategies**
- Pros: 
  - Well-established library with 500+ authentication strategies
  - Extensive community support and documentation
  - Handles edge cases and security best practices
- Cons: 
  - Heavyweight (~200KB minified)
  - Includes many features we won't use
  - Adds another dependency to maintain
- Effort: 2 weeks

**Option 2: Implement OAuth2 flow manually with axios**
- Pros: 
  - Full control over authentication flow
  - Minimal dependencies
  - Can optimize for our specific use case
- Cons: 
  - More code to write and maintain
  - Higher security risk if implementation has bugs
  - Need to handle all OAuth edge cases ourselves
- Effort: 3-4 weeks

**Option 3: Use NextAuth.js (or similar modern library)**
- Pros:
  - Modern, lightweight, designed for React/Next.js apps
  - Built-in session management
  - Good TypeScript support
- Cons:
  - Newer library, smaller community
  - Tightly coupled to Next.js ecosystem (we use Express)
- Effort: 2-3 weeks

### Chosen Approach
**Selected: Option 1 (Passport.js)**

We'll use Passport.js with `passport-google-oauth20` and `passport-github2` strategies because:
1. Battle-tested security implementation reduces risk
2. Development time is critical for our Q1 deadline
3. The additional bundle size (~200KB) is acceptable for our use case
4. Future authentication methods (SAML, LDAP) will be easier to add

**Architecture:**
- Express.js middleware chain: Request → Passport.authenticate() → Route handler
- User data flow: OAuth Provider → Passport Strategy → User Service → Database
- Session management: Express-session with Redis store
- Token storage: Encrypted tokens in PostgreSQL, session IDs in Redis

**Key Components:**
1. `AuthController`: Handles OAuth callback routes and session management
2. `UserService`: Creates/updates user accounts from OAuth profile data
3. `SessionStore`: Redis-backed session storage with 30-day TTL
4. `AuthMiddleware`: Protects routes requiring authentication

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| OAuth provider API changes break auth flow | High | Low | Pin to specific API versions, monitor provider changelogs, add integration tests |
| Session hijacking via XSS/CSRF | High | Medium | Implement CSRF tokens, use HTTP-only secure cookies, add Content Security Policy headers |
| User profile data becomes stale | Medium | High | Implement periodic profile refresh (every 7 days), allow manual refresh |
| Redis outage breaks all sessions | High | Low | Implement Redis clustering for HA, add fallback to database sessions |
| OAuth client secrets leak | Critical | Low | Use environment variables, never commit to git, rotate secrets quarterly |
| Passport.js vulnerabilities | Medium | Low | Enable Dependabot alerts, update regularly, have fallback plan to option 2 |

## Acceptance Criteria
- [ ] User can sign up with Google OAuth2 and create new account
- [ ] User can sign up with GitHub OAuth2 and create new account
- [ ] User can log in with Google if account already exists
- [ ] User can log in with GitHub if account already exists
- [ ] User profile (name, email, avatar) is populated from OAuth provider
- [ ] User session persists across browser restarts
- [ ] User can log out and session is properly terminated
- [ ] Failed authentication displays user-friendly error message
- [ ] Unauthorized access to protected routes redirects to login
- [ ] All authentication events are logged with timestamp, user ID, and provider
- [ ] OAuth flow completes in < 3 seconds (measured via performance monitoring)
- [ ] Session expires after 30 days of inactivity
- [ ] CSRF protection is active on all authentication endpoints
- [ ] Integration tests cover happy path and error scenarios for both providers

## Implementation Tasks
- [ ] Set up OAuth2 applications in Google Cloud Console and GitHub Developer Settings
- [ ] Configure OAuth callback URLs for dev/staging/production environments
- [ ] Install and configure Passport.js with Google and GitHub strategies
- [ ] Implement OAuth callback routes (`/auth/google/callback`, `/auth/github/callback`)
- [ ] Create User model with OAuth provider fields (provider, providerId, email, name, avatarUrl)
- [ ] Implement UserService with `findOrCreateFromOAuthProfile()` method
- [ ] Set up Redis session store with express-session
- [ ] Implement authentication middleware (`isAuthenticated`, `requireAuth`)
- [ ] Add logout route that destroys session and clears cookies
- [ ] Create login page UI with "Sign in with Google" and "Sign in with GitHub" buttons
- [ ] Implement CSRF protection using `csurf` middleware
- [ ] Add authentication event logging to audit service
- [ ] Write unit tests for UserService OAuth profile handling
- [ ] Write integration tests for complete OAuth flow (both providers)
- [ ] Set up monitoring alerts for authentication failures > 5% threshold
- [ ] Update API documentation with authentication requirements
- [ ] Perform security review of OAuth implementation
- [ ] Load test authentication endpoints to validate NFR4 (1000 concurrent requests)

## Open Questions
- Q: Should we implement "remember me" functionality for longer session duration?
  - Decision needed by: Product Manager by 2026-03-05
- Q: What happens if user's email from OAuth provider changes?
  - Impact: May create duplicate accounts or lose existing account access
- Q: Do we support account deletion? If so, what happens to OAuth tokens?
  - Compliance consideration for GDPR
- Q: Should we allow multiple OAuth providers per user account in the future?
  - Would require account linking flow not in current scope
- Q: What's the UX for users who log in with different providers using same email?
  - Current approach: treat as separate accounts; future enhancement for linking

## Notes
- Design mockups for login page: https://figma.com/file/abc123 (internal link)
- Related GitHub discussion on OAuth security: https://github.com/simplespec/simplespec/discussions/42
- Competitive analysis: Analyzed auth flows of 5 competitors (see attached document)
- OAuth2 RFC 6749: https://datatracker.ietf.org/doc/html/rfc6749
- Security best practices: https://oauth.net/2/oauth-best-practice/
- Consider migration path from old password-based accounts (separate spec needed)
