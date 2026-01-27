import { Router } from "express";

export abstract class BaseRoute {
  public readonly name: string;
  public readonly router: Router;

  constructor(name: string) {
    this.name = name;
    this.router = Router();
    this.defineRoutes();
  }

  // Each subclass must implement this to define its routes
  protected abstract defineRoutes(): void;
}
