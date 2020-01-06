# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2020-01-06

### Added
- Update generated model hooks to provide referential equality for anonymous objects/functions out of the box

### Fixed
- Issue where models are not instantiated until first render of associated model hooks resulting from `buildModel` ([#4](https://github.com/JBKLabs/react-models/issues/4))

## [0.1.1] - 2020-01-03

### Fixed
- infinite render loop when using hook resulting from `buildModel` ([#2](https://github.com/JBKLabs/react-models/issues/2))