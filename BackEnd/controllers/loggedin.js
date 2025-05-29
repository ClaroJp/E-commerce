const loggedin = (req, res) => {
  // req.user is set by authMiddleware if logged in
  if (!req.user) {
    return res.status(401).json({ loggedIn: false });
  }

  return res.json({
    loggedIn: true,
    user: {
      id: req.user.user_id,
      email: req.user.email,
      role: req.user.role,
      name: req.user.name,
      profile_image: req.user.profile_image,
    }
  });
};

module.exports = loggedin;
