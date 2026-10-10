const pkg = require('./package.json');

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

module.exports = {
  ...pkg.build,
  productName: 'MineMarker',
  win: {
    ...pkg.build.win,
    target: [{ target: 'appx', arch: ['x64'] }],
    signAndEditExecutable: false,
    artifactName: 'MineMarker-${version}-Store-${arch}.${ext}'
  },
  appx: {
    identityName: required('STORE_IDENTITY_NAME'),
    publisher: required('STORE_PUBLISHER'),
    publisherDisplayName: required('STORE_PUBLISHER_DISPLAY_NAME'),
    displayName: 'MineMarker',
    applicationId: 'MineMarker',
    backgroundColor: '#0B0F10',
    artifactName: 'MineMarker-${version}-Store-${arch}.${ext}'
  }
};
