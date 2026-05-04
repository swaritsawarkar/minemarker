# MineMarker

**MineMarker** is a Minecraft creator editing tool that helps YouTubers find important moments in long recordings faster.

Instead of scrubbing through hours of footage manually, creators can use MineMarker to log gameplay markers, automatically track important in-game events, and view everything later on a local editing timeline.

The goal is simple:

> Turn raw Minecraft gameplay into an organized editing timeline.

---

## Why this exists

Minecraft creators often record long sessions where useful moments are buried between mining, walking, building, exploring, dying, fighting mobs, or doing random survival stuff.

A normal video editor only sees video and audio.

Minecraft knows what actually happened in the game.

MineMarker uses that in-game context to help creators find moments like:

- diamonds mined
- ancient debris found
- deaths
- Nether entry
- advancements
- low health moments
- manual funny moments
- building progress
- important creator notes

---

## What MineMarker does

MineMarker is built in three versions.

### V1: Manual Marker Mod

A Fabric Minecraft mod that lets creators manually add timestamps while playing.

Example:

```mcfunction
/minemarker start episode-1
/minemarker mark diamond_ore found diamonds near lava
/minemarker mark funny_moment creeper scared me
/minemarker stop
