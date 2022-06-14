"use strict";

/**
 * `alert-observer-middleware` middleware.
 */

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    if (
      ctx.request.method === "POST" &&
      ctx.request.url.includes(
        "content-manager/collection-types/api::devices-data.devices-data"
      )
    ) {
      const req = ctx.request.body.data || ctx.request.body;
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
                  alert_condition: alert,
                  value: req.value,
                },
              })
          )
      );
    }
    await next();
  };
};
