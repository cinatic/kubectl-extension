const { GObject } = imports.gi
const Signals = imports.signals

const EventHandler = class {}

Signals.addSignalMethods(EventHandler.prototype)
