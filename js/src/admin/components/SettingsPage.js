import Alert from 'flarum/components/Alert';
import Button from 'flarum/components/Button';
import emoji from '../../common/util/emoji';
import Page from 'flarum/components/Page';
import Select from 'flarum/components/Select';
import saveSettings from 'flarum/utils/saveSettings';
import Switch from 'flarum/components/Switch';

export default class SettingsPage extends Page {
    init() {
        this.fields = ['convertToUpvote', 'convertToDownvote', 'convertToLike'];

        this.values = {};

        this.reactions = app.forum.reactions();

        this.settingsPrefix = 'fof-reactions';

        const settings = app.data.settings;

        this.newReaction = {
            identifier: m.prop(''),
            type: m.prop('emoji'),
        };

        this.fields.forEach((key) => (this.values[key] = m.prop(settings[this.addPrefix(key)])));
    }

    /**
     * @returns {*}
     */
    view() {
        return (
            <div className="SettingsPage--reactions">
                <div className="container">
                    <form onsubmit={this.onsubmit.bind(this)}>
                        <fieldset>
                            <legend>{app.translator.trans('fof-reactions.admin.page.reactions.title')}</legend>
                            <label>{app.translator.trans('fof-reactions.admin.page.reactions.reactions')}</label>
                            <div style="margin-bottom: -10px" className="helpText">
                                {app.translator.trans('fof-reactions.admin.page.reactions.Helptext')}
                            </div>
                            <br />
                            <div className="Reactions--Container">
                                {this.reactions.map((reaction) => {
                                    const spanClass = reaction.type() === 'icon' && `fa fa-${reaction.identifier()} Reactions-demo`;
                                    const data = emoji(reaction.identifier());
                                    const demos = [];

                                    if (reaction.type() === 'icon') {
                                        demos.push(
                                            <i className={spanClass} aria-hidden>
                                                &nbsp;
                                            </i>
                                        );
                                    }

                                    if ((reaction.type === 'emoji' && data.uc) || data.uc) {
                                        demos.push(
                                            <img
                                                alt={reaction.identifier()}
                                                className="Reactions-demo"
                                                draggable="false"
                                                style={reaction.type() !== 'emoji' && 'opacity: 0.5;'}
                                                src={data.url}
                                                width="30px"
                                            />
                                        );
                                    }

                                    return [
                                        <div className="Reactions--item">
                                            <input
                                                className="FormControl Reactions-input"
                                                value={reaction.display() || ''}
                                                placeholder={app.translator.trans('fof-reactions.admin.page.reactions.help.display')}
                                                oninput={m.withAttr('value', (val) => this.update(reaction, 'display', val))}
                                            />
                                            <input
                                                className="FormControl Reactions-input"
                                                type="text"
                                                value={reaction.identifier()}
                                                placeholder={app.translator.trans('fof-reactions.admin.page.reactions.help.identifier')}
                                                oninput={m.withAttr('value', (val) => this.update(reaction, 'identifier', val))}
                                            />
                                            {Select.component({
                                                options: { emoji: 'emoji', icon: 'icon' },
                                                value: reaction.type(),
                                                onchange: (val) => this.update(reaction, 'type', val),
                                            })}
                                            {Switch.component({
                                                className: 'Reactions-switch',
                                                state: reaction.enabled(),
                                                onchange: (val) => this.update(reaction, 'enabled', val),
                                            })}
                                            {Button.component({
                                                type: 'button',
                                                className: 'Button Button--warning Reactions-button',
                                                icon: 'fa fa-times',
                                                onclick: this.deleteReaction.bind(this, reaction),
                                            })}

                                            <div className="Reactions-demo">{demos}</div>
                                        </div>,
                                    ];
                                })}
                                <br />
                                <div className="Reactions--item">
                                    <input
                                        className="FormControl Reactions-input"
                                        type="text"
                                        loading={this.addLoading}
                                        placeholder={app.translator.trans('fof-reactions.admin.page.reactions.help.identifier')}
                                        oninput={m.withAttr('value', this.newReaction.identifier)}
                                    />
                                    {Select.component({
                                        options: { emoji: 'emoji', icon: 'icon' },
                                        disabled: this.addLoading,
                                        value: this.newReaction.type(),
                                        onchange: this.newReaction.type,
                                    })}
                                    {Button.component({
                                        type: 'button',
                                        className: 'Button Button--warning Reactions-button',
                                        icon: this.addLoading ? '' : 'fa fa-plus',
                                        loading: this.addLoading,
                                        onclick: this.addReaction.bind(this),
                                    })}
                                    {this.newReaction.type() === 'icon' ? (
                                        <i
                                            className={this.newReaction.type() === 'icon' && `fa fa-${this.newReaction.identifier()} Reactions-demo`}
                                            aria-hidden
                                        >
                                            &nbsp;
                                        </i>
                                    ) : (
                                        ''
                                    )}

                                    {emoji(this.newReaction.identifier()).uc ? (
                                        <img
                                            alt={this.newReaction.identifier()}
                                            className="Reactions-demo"
                                            draggable="false"
                                            style={this.newReaction.type() !== 'emoji' && 'opacity: 0.5;'}
                                            src={emoji(this.newReaction.identifier()).url}
                                            width="30px"
                                        />
                                    ) : (
                                        ''
                                    )}
                                </div>
                            </div>
                        </fieldset>
                        <fieldset>
                            <div className="Reaction-settings">
                                {this.isEnabled('fof-gamification') || this.isEnabled('flarum-likes') ? (
                                    <legend>{app.translator.trans('fof-reactions.admin.page.settings.integrations.legend')}</legend>
                                ) : (
                                    ''
                                )}
                                {this.isEnabled('fof-gamification') ? (
                                    <div>
                                        <legend>{app.translator.trans('fof-reactions.admin.page.settings.integrations.gamification.legend')}</legend>
                                        <label>
                                            {app.translator.trans('fof-reactions.admin.page.settings.integrations.gamification.upvoteLabel')}
                                        </label>
                                        <div className="helpText">
                                            {app.translator.trans('fof-reactions.admin.page.settings.integrations.gamification.upvoteHelptext')}
                                        </div>
                                        <input
                                            className="FormControl reactions-settings-input"
                                            value={this.values.convertToUpvote() || ''}
                                            placeholder="thumbsup"
                                            oninput={m.withAttr('value', this.values.convertToUpvote)}
                                        />
                                        <label>
                                            {app.translator.trans('fof-reactions.admin.page.settings.integrations.gamification.downvoteLabel')}
                                        </label>
                                        <div className="helpText">
                                            {app.translator.trans('fof-reactions.admin.page.settings.integrations.gamification.downvoteHelptext')}
                                        </div>
                                        <input
                                            className="FormControl reactions-settings-input"
                                            value={this.values.convertToDownvote() || ''}
                                            placeholder="thumbsdown"
                                            oninput={m.withAttr('value', this.values.convertToDownvote)}
                                        />
                                    </div>
                                ) : (
                                    ''
                                )}
                                {this.isEnabled('flarum-likes') ? (
                                    <div>
                                        <legend>{app.translator.trans('fof-reactions.admin.page.settings.integrations.likes.legend')}</legend>
                                        <label>{app.translator.trans('fof-reactions.admin.page.settings.integrations.likes.Label')}</label>
                                        <div className="helpText">
                                            {app.translator.trans('fof-reactions.admin.page.settings.integrations.likes.Helptext')}
                                        </div>
                                        <input
                                            className="FormControl reactions-settings-input"
                                            value={this.values.convertToLike() || ''}
                                            placeholder="thumbsup"
                                            oninput={m.withAttr('value', this.values.convertToLike)}
                                        />
                                    </div>
                                ) : (
                                    ''
                                )}
                            </div>
                            {this.values.convertToUpvote() && this.values.convertToLike() ? (
                                <h3 className="Reactions-warning">
                                    {app.translator.trans('fof-reactions.admin.page.settings.integrations.warning')}
                                </h3>
                            ) : (
                                ''
                            )}
                            {Button.component({
                                type: 'submit',
                                className: 'Button Button--primary',
                                children: app.translator.trans('fof-reactions.admin.page.settings.save_settings', {
                                    strong: <strong />,
                                }),
                                loading: this.loading,
                                disabled: !this.changed(),
                            })}
                        </fieldset>
                    </form>
                </div>
            </div>
        );
    }

    /**
     * @returns boolean
     */
    changed() {
        var fieldsCheck = this.fields.some((key) => this.values[key]() !== app.data.settings[this.addPrefix(key)]);
        return fieldsCheck;
    }

    addReaction() {
        const reaction = app.store.createRecord('reactions');

        this.addLoading = true;

        reaction
            .save({
                identifier: this.newReaction.identifier(),
                type: this.newReaction.type(),
            })
            .then(() => {
                this.reactions.push(reaction);

                this.newReaction.identifier('');
                this.newReaction.type('icon');

                this.addLoading = false;

                m.redraw();
            })
            .catch(() => {
                this.addLoading = false;

                m.redraw();
            });
    }

    update(reaction, key, value) {
        app.request({
            method: 'PATCH',
            url: `${app.forum.attribute('apiUrl')}/reactions/${reaction.id()}`,
            data: {
                [key]: value,
            },
        });

        this.reactions.some((r, i) => {
            if (r.id() === reaction.id()) {
                reaction[key] = m.prop(value);
                return true;
            }
        });
    }

    deleteReaction(reactionToDelete) {
        app.request({
            method: 'DELETE',
            url: `${app.forum.attribute('apiUrl')}/reactions/${reactionToDelete.id()}`,
        });
        this.reactions.some((reaction, i) => {
            if (reaction.id() === reactionToDelete.id()) {
                this.reactions.splice(i, 1);
                return true;
            }
        });
    }

    onsubmit(e) {
        // prevent the usual form submit behaviour
        e.preventDefault();

        // if the page is already saving, do nothing
        if (this.loading) return;

        // prevents multiple savings
        this.loading = true;

        // remove previous success popup
        app.alerts.dismiss(this.successAlert);

        const settings = {};

        // gets all the values from the form
        this.fields.forEach((key) => (settings[this.addPrefix(key)] = this.values[key]()));

        // actually saves everything in the database
        saveSettings(settings)
            .then(() => {
                // on success, show popup
                app.alerts.show(
                    (this.successAlert = new Alert({
                        type: 'success',
                        children: app.translator.trans('core.admin.basics.saved_message'),
                    }))
                );
            })
            .catch(() => {})
            .then(() => {
                // return to the initial state and redraw the page
                this.loading = false;
                m.redraw();
            });
    }

    isEnabled(name) {
        const enabled = JSON.parse(app.data.settings.extensions_enabled);

        return enabled.indexOf(name) !== -1;
    }

    /**
     * @returns string
     */
    addPrefix(key) {
        return `${this.settingsPrefix}.${key}`;
    }
}
