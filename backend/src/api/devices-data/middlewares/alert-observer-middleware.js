"use strict";

/**
 * `alert-observer-middleware` middleware.
 */

module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    if (
      ctx.request.method === "POST" &&
      ctx.request.path.includes("device-data")
    ) {
      // {"value":4214,"device":13}
      const req = ctx.request.body.data;
      const device = await strapi.entityService.findOne(
        "api::device.device",
        +req.device,
        {
          populate: ["alert_conditions"],
        }
      );
      await Promise.all(
        device.alert_conditions
          .filter((alert) => eval(`${req.value}${alert.logic}${alert.value}`))
          .map(
            async (alert) =>
              await strapi.entityService.create("api::alert.alert", {
                data: {
                  alert_condition: alert.id,
                  value: req.value,
                },
              })
          )
      );
    }
    await next();
  };
};
