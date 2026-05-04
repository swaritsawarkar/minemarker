package com.minemarker;

public class PlayerSnapshot {
	private final Integer x;
	private final Integer y;
	private final Integer z;
	private final String dimension;
	private final String biome;
	private final Float health;
	private final Integer hunger;

	public PlayerSnapshot(Integer x, Integer y, Integer z, String dimension, String biome, Float health, Integer hunger) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.dimension = dimension;
		this.biome = biome;
		this.health = health;
		this.hunger = hunger;
	}

	public static PlayerSnapshot empty() {
		return new PlayerSnapshot(null, null, null, null, null, null, null);
	}

	public Integer x() {
		return x;
	}

	public Integer y() {
		return y;
	}

	public Integer z() {
		return z;
	}

	public String dimension() {
		return dimension;
	}

	public String biome() {
		return biome;
	}

	public Float health() {
		return health;
	}

	public Integer hunger() {
		return hunger;
	}
}
