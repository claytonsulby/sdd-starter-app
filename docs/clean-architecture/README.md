# Clean Architecture

## Quickstart

Clean architecture organizes your code in layers (the names change but the purpose stay the same):

1. Domain
2. Application
3. Interfaces
4. Presentation

Then the "Application Container" connects them all up.

### Domain (Core)

The core of your app.

The domain layer contains the "things" and "rules" related to what you are building the app for.

"Things" mean entities, aggregates, value-objects, essentially the models that represent something real. 

For instance `sensor.ts` might be a model for a real sensor you are connecting to. `sample-rate.ts` might be a value needed throughout your code. `sensor-region.ts` might be an aggregate for sensors that are grouped together.

"Rules" mean services, essentially the logic that is core to what you are accomplishing. For instance `pressure-calculation.ts` might be a service that you need to calculate pressure.

### Application (Features)

What your app should do, e.g. features.

The application layer contains "use cases" for what your _app_ does within the domain or even better, anything _you_ or someone using the app would want to be able to do. For instance `read-data-from-sensors.ts` is a use case that reads data from the sensors.

### Interface (Tools)

How your app uses the features.

The interface layer is where your use cases _interface_ with your actual application code. Controllers, presenters, and repositories live here.

A controller _controls_ the use cases and entites and services. A presenter _presents_ the controller output. For instance `sensor-controller.ts` is a controller that can read the sensor data, and `sensor-data-presenter.ts` presents the data from the controller in a the way that is best for you.

A repository is a bit more abstract. Think of this as a "port" like on a mechanical device. If you have an iPhone you need power and the port is USB-C. But if you only have a 'Lightning' cable, you need an "adapter". For instance `sensor-reader-repository.ts` is the port (power from the example) and `read-sensor-over-serial-repository.ts` is the "Serial" adapter (lightning from the example). If you found out you actually want to use wifi to connect instead of serial you can just create another adapter, `read-sensor-over-wifi-repository.ts` and then implement that.

### Presentation (Drivers)

How anyone can use the app.

The presentation layer is where your users and you can use the app. This is where framework related code lives. For instance "Next" and "React-Native" related code can live here. Both can use the controllers so this is how you *can keep your code modular!*

### Application Container

How the layers get connected.

The application container is how you create and connect everything up. For example, use cases accept the port but not the adapter, so you need to tell it which adapter to use. For instance, `serial-application-container.ts` would tell the use cases to use the `read-sensor-over-serial-repository.ts` adapter whereas `wifi-application-container.ts` would use the `read-sensor-over-wifi-repository.ts`. You would to this all the way up to the controller, then in your UI code (in the presentation layer or anywhere), you could just access the application container, and use the controller to access all of your use cases.

## Example

See `/lib` and `/app/(pages)/clean-architecture/page.tsx` for an example. Also all of the files contain "[Prompt]" comments that show you the exact prompts I used to generate the file.