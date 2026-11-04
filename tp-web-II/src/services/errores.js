
export class ErrorRed extends Error {
  constructor(mensaje = "No se pudo conectar. Revisá tu conexión e intentá de nuevo.") {
    super(mensaje);
    this.name = "ErrorRed";
  }
}

export class ErrorHttp extends Error {
  constructor(estado, mensaje) {
    super(mensaje);
    this.name = "ErrorHttp";
    this.estado = estado;
  }
}

export class ErrorPermiso extends Error {
  constructor(mensaje = "No tenés permisos para realizar esta acción.") {
    super(mensaje);
    this.name = "ErrorPermiso";
    this.estado = 403;
  }
}

export class ErrorNoEncontrado extends Error {
  constructor(mensaje = "No se encontró el elemento solicitado.") {
    super(mensaje);
    this.name = "ErrorNoEncontrado";
    this.estado = 404;
  }
}

export class ErrorDependencia extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorDependencia";
    this.estado = 409;
  }
}

export class ErrorValidacion extends Error {
  constructor(campos) {
    super("Revisá los campos marcados en el formulario.");
    this.name = "ErrorValidacion";
    this.campos = campos;
  }
}
