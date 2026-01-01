module.exports = {
  apps: [
    {
      name: "water_info_hub",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3008 -H 127.0.0.1",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
