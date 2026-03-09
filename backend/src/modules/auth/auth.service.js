// ── auth.service.js ──────────────────────────────────────────
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../users/user.model");
const WorkspaceUser = require("../workspaces/workspaceUser.model.js");

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-prod";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

async function loginOwner({ email, password }) {
  if (!email.endsWith("@crudzaso.com")) {
    throw Object.assign(new Error("Only @crudzaso.com emails allowed"), {
      status: 403,
    });
  }
  const user = await User.findOne({ where: { email, role: "OWNER" } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }
  return {
    token: signToken({ id: user.id, role: "OWNER" }),
    user: sanitize(user),
  };
}

async function loginWorkspace({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }
  const memberships = await WorkspaceUser.findAll({
    where: { userId: user.id },
    include: ["workspace"],
  });
  return {
    token: signToken({ id: user.id }),
    user: sanitize(user),
    workspaces: memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      role: m.role,
      status: m.workspace.status,
    })),
  };
}

async function registerWorkspace({ name, email, password, inviteToken }) {
  const exists = await User.findOne({ where: { email } });
  if (exists)
    throw Object.assign(new Error("Email already registered"), { status: 409 });

  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash: hash,
    role: "AGENT",
  });

  // If user registered via invitation link, auto-accept it
  if (inviteToken) {
    try {
      const workspaceService = require("../workspaces/workspaces.service.js");
      await workspaceService.finalizeInvitation(inviteToken, user.id);
    } catch (err) {
      console.warn("[Auth] Could not finalize invitation:", err.message);
      // Don't block registration if invite finalization fails
    }
  }

  return { token: signToken({ id: user.id }), user: sanitize(user) };
}

function sanitize(u) {
  const { passwordHash, ...safe } = u.get({ plain: true });
  return safe;
}

// ── Passport strategies ──────────────────────────────────────
function initPassport(passport) {
  const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
  const GoogleStrategy = require("passport-google-oauth20").Strategy;

  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET || "change-me",
      },
      async (payload, done) => {
        try {
          const user = await User.findByPk(payload.id, {
            attributes: { exclude: ["passwordHash"] },
          });
          if (!user || !user.isActive) return done(null, false);
          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      },
    ),
  );

  if (process.env.GOOGLE_CLIENT_ID) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails[0].value;
            let user = await User.findOne({ where: { googleId: profile.id } });
            if (!user) {
              user = await User.findOne({ where: { email } });
              if (user) {
                user.googleId = profile.id;
                await user.save();
              } else {
                user = await User.create({
                  name: profile.displayName,
                  email,
                  googleId: profile.id,
                  role: "AGENT",
                });
              }
            }
            return done(null, user);
          } catch (err) {
            return done(err, null);
          }
        },
      ),
    );
  }
}

module.exports = {
  loginOwner,
  loginWorkspace,
  registerWorkspace,
  initPassport,
};
