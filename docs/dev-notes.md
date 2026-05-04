# Development Notes

## Verified Toolchain

Checked on 2026-05-04:

- Minecraft Java `26.1.2`
- Fabric Loader `0.19.2`
- Fabric API `0.148.0+26.1.2`
- Fabric Loom `1.16.1`
- Java `25`
- Gradle `9.5.0`

Fabric's example branch for `26.1.2` used `loom_version=1.16-SNAPSHOT` and `fabric_api_version=0.147.0+26.1.2`; this project uses the stable Loom `1.16.1` and the latest matching Fabric API `0.148.0+26.1.2` found in Maven metadata.

## Local Machine Notes

The machine PATH initially contained:

- Java 8 runtime
- no `javac`
- no system `gradle`
- no `gh` CLI

For verification, a portable Temurin JDK 25 and Gradle 9.5.0 were downloaded to the user cache. The repo includes the Gradle wrapper after generation.

## Build Command

```powershell
cd minemarker-mod
$env:JAVA_HOME="$env:USERPROFILE\.cache\minemarker-tools\jdk-25"
.\gradlew.bat clean build
```

## GitHub Notes

No remote `origin` is configured yet. Pushing requires a real GitHub repo URL and working authentication.

