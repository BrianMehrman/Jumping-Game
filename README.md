# Jumping Game

Simple retro arcade example to show off some game concepts


## Movement

- `a` - move left
- `w` - jump
- `s` - move right
- `d` - duck, move down
- `space` - player start


## Level Maps

The game map is defined in the `db.json` file. Each entry represent a `tile`.

The tile contains a `location` and a `type`

```
{
  "location": {"x": 1, "y": 1},
  "type": "start"
}
```

### Tile Types

There are different tile types

- `start` - player start
- `ground` - default tile type
- `coins` - where a coin item is placed

# Todo

[] - gravity
[] - collision
[] - level map
[] - item placement
[] - item pickup
[] - timer/scoreboard
