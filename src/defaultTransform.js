const defaultTransform = (config) => (all) => {
  if (!all) {
    return [];
  }

  return all.filter((item) =>
    Object.keys(config).reduce(
      (valid, next) => item[next] === config[next] && valid,
      true
    )
  );
};

export default defaultTransform;
