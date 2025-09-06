import type { Component } from 'solid-js';

type Position = { x: number; y: number };

type Point = { x: number; y: number };

type Shape = {
  name: string;
  shapeComponent: Component;
  settingsComponent: Component;
};
