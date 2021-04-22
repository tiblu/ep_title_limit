'use strict';

/**
 * collectContentPre
 *
 * This hook is called before the content of a node is collected by the usual methods. The cc object can be used to do a bunch of things that modify the content of the pad. See, for example, the heading1 plugin for etherpad original.
 *
 * E.g. if you need to apply an attribute to newly inserted characters, call cc.doAttrib(state, "attributeName") which results in an attribute attributeName=true.
 *
 * If you want to specify also a value, call cc.doAttrib(state, "attributeName::value") which results in an attribute attributeName=value.
 *
 * @param hook
 * @param context
 * @returns {*}
 *
 * @see https://etherpad.org/doc/v1.8.13/#index_collectcontentpre
 */
exports.collectContentPre = (hook, context) => {
  console.debug('ep_title_limit', hook, arguments);
  // context.cls - class name of the element being handled, null if element has no class attribute
  if (context.cls && context.cls.indexOf('ep_title_limit_ttl') > -1) {
    context.cc.doAttrib(context.state, 'ep_title_limit_ttl::ep_title_limit_ttl');
  }
};
