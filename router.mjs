export class Router {
  routes = {
    GET: {},
    POST: {},
    DELETE: {},
    PUT: {},
  };
  get(route, handler) {
    this.routes['GET'][route] = handler;
  }
  post(route, handler) {
    this.routes['POST'][route] = handler;
  }
  delete(route, handler) {
    this.routes['DELETE'][route] = handler;
  }
  put(route, handler) {
    this.routes['PUT'][route] = handler;
  }
  find(method, route) {
    return this.routes[method]?.[route] || null;
  }
}
