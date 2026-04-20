let handler;

try {
  const mod = await import('../src/app.js');
  handler = mod.default;
} catch (err) {
  handler = (req, res) => {
    res.status(500).json({
      crashed: true,
      error: err.message,
      stack: err.stack
    });
  };
}

export default handler;
