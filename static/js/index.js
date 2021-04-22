'use strict';

const _ = require('ep_etherpad-lite/static/js/underscore');
const Changeset = require('ep_etherpad-lite/static/js/Changeset');

let previousTitleText;

const _checkLineForAttr = (rep, line, attr) => {
    const alineAttrs = rep.alines[line];
    let hasAttr = false;
    if (alineAttrs) {
        const opIter = Changeset.opIterator(alineAttrs);
        while (opIter.hasNext()) {
            const op = opIter.next();
            const r = Changeset.opAttributeValue(op, attr, rep.apool);
            if (r) {
                hasAttr = true;
            }
        }
    }

    return hasAttr;
};

const _hideInfoModal = () => {
    console.debug('ep_title_limit._hideInfoModal', arguments);

    $('#ep_title_limit_ttl_modal').hide();
    $('#ep_title_limit_ttl_modal').removeClass('popup-show');
};

// display and position info modal
const _displayInfoModal = () => {
    console.debug('ep_title_limit._displayInfoModal', arguments);

    const padOuter = $('iframe[name="ace_outer"]').contents().find('body');
    const padInner = padOuter.find('iframe[name="ace_inner"]');
    const modal = $('#ep_title_limit_ttl_modal');
    const line = padInner.contents().find('body').children()[0];
    const lineOffsetTop = $(line).offset().top;
    const innerPaddingTop = parseInt(padInner.css('padding-top'));
    const ebHeight = $('#editbar').height();

    const top = lineOffsetTop + $(line)[0].offsetHeight + innerPaddingTop + ebHeight;

    $(modal).off();
    $(modal).on('click', () => {
        _hideInfoModal();
    });
    $(modal).show();
    $(modal).addClass('popup-show');
    $(modal).css({
        top,
    });
};


// Wrap over limit text with marker and display info modal
let doInsertTitleLimitMark = function () {
    console.debug('ep_title_limit.doInsertTitleLimitMark', arguments, this);

    const maxLength = window.clientVars.ep_title_limit.maxLength;
    const rep = this.rep;
    const documentAttributeManager = this.documentAttributeManager;
    const line = rep.lines.atIndex(0);
    let text = line.text;
    text = text.replace(/(^\*)/, '');

    if (text === previousTitleText) {
        // NOTE! If the text has not changes, there is nothing to update in the UI!
        return;
    }

    if (text.trim().length <= maxLength) {
        previousTitleText = text;
        if (_checkLineForAttr(rep, 0, 'ep_title_limit_ttl')) {
            console.debug('ep_title_limit.setAttributesOnRange', 'UNSET');
            documentAttributeManager.setAttributesOnRange([0, 0], [0, line.text.length], [['ep_title_limit_ttl', false]]);
        }
        _hideInfoModal();
    } else {
        console.debug('ep_title_limit.setAttributesOnRange', 'SET');
        documentAttributeManager.setAttributesOnRange(
            [0, maxLength + 1],
            [0, line.text.length], [['ep_title_limit_ttl', 'ep_title_limit_ttl']]
        );
        previousTitleText = text;
        _displayInfoModal();
    }
};

/**
 * aceAttribsToClasses
 *
 * This hook is called during the attribute processing procedure, and should be used to translate key, value pairs into valid HTML classes that can be inserted into the DOM.
 * The return value for this function should be a list of classes, which will then be parsed into a valid class string.
 *
 * @param hook
 * @param context
 * @returns {[string]}
 *
 * @see https://etherpad.org/doc/v1.8.13/#index_aceattribstoclasses
 */
exports.aceAttribsToClasses = (hook, context) => {
    console.debug('ep_title_limit.aceAttribsToClasses', arguments);

    // Our ep_title_limit_ttl attribute will result in a ep_title_limit_ttl class
    if (context.key.indexOf('ep_title_limit_ttl:') !== -1) {
        return ['ep_title_limit_ttl'];
    }
    if (context.key === 'ep_title_limit_ttl') {
        return ['ep_title_limit_ttl'];
    }
};

/**
 * aceInitialized
 *
 * @param hook
 * @param context
 *
 * @see https://etherpad.org/doc/v1.8.13/#index_aceinitialized
 */

// Once ace is initialized, we set ace_doInsertTitleLimitMark and bind it to the context
exports.aceInitialized = (hook, context) => {
    const editorInfo = context.editorInfo;
    editorInfo.ace_doInsertTitleLimitMark = _(doInsertTitleLimitMark).bind(context);
};

// Triggers before any changes are made, enables plugins to change outcome
exports.aceKeyEvent = (hook, context) => {
    // Check for 'keydown' event only for mobiles to act the same way as desktop - https://github.com/citizenos/citizenos-fe/issues/535#issuecomment-805897450
    if (context.evt.type !== 'keydown') {
        return false;
    }

    // Avoid race condition (callStack === null)
    setTimeout(function () {
        context.editorInfo.ace_callWithAce(function (ace) {
            const activeLine = ace.ace_caretLine();
            if (activeLine === 0) {
                ace.ace_doInsertTitleLimitMark();
            }
        }, 'insertTitleLimitMark', true);
    }, 0);

    // Take away EP-s special handling of BACKSPACE
    // FIXME: IF IT WORKS, MACs CMD-H (backspace) should also be handled
    if (evt.key === 'Backspace' || evt.keyCode === 8) {
        return true;
    }

    return false;
};

exports.aceEditorCSS = () => ['ep_title_limit/static/css/ep_title_limit.css'];

