window.__ModuleLoader__.load({
  id: '@dawn0608/dsh-session-cost',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    let ReactDOM = null;
    try {
      ReactDOM = require('react-dom');
    } catch (error) {
      ReactDOM = null;
    }

    const NS = 'sessionCost';
    const STATE_PATH = '/plugin/session-cost/state';
    const CHANNEL_URL = 'api/session-cost/state';

    const DICTS = {
      zh: {
        pillCost: '{amount}',
        pillBalance: '余额 {amount}',
        pillBalanceUnknown: '余额 —',
        pillBalanceLoading: '余额 …',
        pillSeparator: '·',
        panelTitle: '会话花费与余额',
        costTitle: '会话花费',
        modelLabel: '模型',
        callsLabel: '模型请求',
        callsValue: '{count} 次',
        webLabel: '网页搜索与抓取',
        webValue: '{count} 次',
        balanceLabel: '账户余额',
        bonusLabel: '赠送余额',
        statusLabel: '状态',
        balanceLoading: '读取中…',
        openDetails: '查看花费与余额明细',
        reasonMissingKey: '未配置 API Key',
        reasonUnauthorized: 'API Key 无效',
        reasonNetwork: '网络请求失败',
        reasonTimeout: '请求超时',
        reasonNoEndpoint: '无法连接 Host',
        reasonNoWallet: '暂无可用余额',
        reasonNotLive: '会话未在运行',
        reasonPricePending: '价格获取中',
        reasonPriceFailed: '价格获取失败',
        reasonFailed: '读取失败',
      },
    };

    // DSH 的 locale 运行时保留 en 回退键；它与中文词典指向同一份内容，
    // 因此插件不会渲染英文文案。
    DICTS.en = DICTS.zh;

    const CSS = [
      '.dshsc_anchor{min-width:0;flex:none;font-size:calc(var(--dsh-content-font-size-secondary,13px) - 1px);line-height:calc(20px + var(--dsh-content-font-delta-secondary,0px));display:inline-flex}',
      '.dshsc_pill{box-sizing:border-box;border-radius:var(--dsw-radius-sm);color:var(--dsw-alias-label-tertiary);font:inherit;font-variant-numeric:tabular-nums;line-height:inherit;white-space:nowrap;background:0 0;border:none;align-items:center;gap:6px;padding:1px 8px;display:inline-flex;cursor:pointer}',
      '.dshsc_pill:hover,.dshsc_pill[aria-expanded="true"]{background:var(--dsw-alias-interactive-bg-hover)}',
      '.dshsc_pill:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}',
      '.dshsc_icon{width:14px;height:14px;flex:none;display:block}',
      '.dshsc_label{white-space:nowrap}',
      '.dshsc_panel{z-index:1100;box-sizing:border-box;border-radius:var(--dsw-radius-lg);background:var(--dsw-specific-menu);width:max-content;min-width:min(300px,100vw - 24px);max-width:min(440px,100vw - 24px);backdrop-filter:var(--dsw-menu-backdrop-filter);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-secondary);cursor:default;border:0;padding:16px;font-size:12px;line-height:18px;position:fixed}',
      '.dshsc_title{color:var(--dsw-alias-label-primary);justify-content:space-between;gap:16px;margin-bottom:8px;font-weight:500;display:flex}',
      '.dshsc_titleLabel{align-items:center;gap:6px;min-width:0;display:inline-flex}',
      '.dshsc_titleLabel svg{flex:none;width:14px;height:14px}',
      '.dshsc_titleValue{font-variant-numeric:tabular-nums}',
      '.dshsc_rule{border-top:.5px solid var(--dsw-alias-border-l2);margin-bottom:10px}',
      '.dshsc_details{color:var(--dsw-alias-label-tertiary);grid-template-columns:minmax(76px,auto) minmax(0,1fr);gap:6px 16px;margin:0;display:grid}',
      '.dshsc_details dt,.dshsc_details dd{min-width:0;margin:0}',
      '.dshsc_details dd{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;text-align:right}',
    ].join('');

    /** Interpolate `{name}` placeholders without depending on the locale service. */
    function format(template, params) {
      return String(template).replace(/\{(\w+)\}/g, (match, key) =>
        params && Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match);
    }

    function money(amount, symbol) {
      const value = Number(amount);
      if (!Number.isFinite(value)) return `${symbol}—`;
      return `${symbol}${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function countText(value) {
      const number = Number(value);
      return Number.isFinite(number) ? number.toLocaleString('en-US') : '—';
    }

    function currencySymbol(currency) {
      return currency === 'USD' ? '$' : '¥';
    }

    /**
     * Candidate state URLs for this page. The Web carrier answers the plain
     * route directly; the connection channel is the same `api/...` form the RPC
     * transport uses, so a mounted page and a static desktop page both reach it.
     */
    function stateCandidates(sessionId) {
      const query = sessionId === undefined ? '' : `?session=${encodeURIComponent(String(sessionId))}`;
      const urls = [];
      const transport = window.__DSH_TRANSPORT__;
      if (transport && typeof transport.streamBaseUrl === 'string' && transport.streamBaseUrl !== '') {
        try {
          const url = new URL(transport.streamBaseUrl, location.href);
          const scheme = url.protocol === 'wss:' ? 'https:' : url.protocol === 'ws:' ? 'http:' : url.protocol;
          urls.push(`${scheme}//${url.host}${STATE_PATH}${query}`);
        } catch (error) {
          // Fall through to the document origin.
        }
      }
      if (location.protocol === 'http:' || location.protocol === 'https:') {
        urls.push(`${location.origin}${STATE_PATH}${query}`);
      }
      urls.push(`${CHANNEL_URL}${query}`);
      return urls.filter((value, index) => urls.indexOf(value) === index);
    }

    function walletTotal(wallet) {
      if (Number.isFinite(wallet.total) && wallet.total > 0) return wallet.total;
      return (Number(wallet.toppedUp) || 0) + (Number(wallet.granted) || 0);
    }

    /** How often one Session's state may be re-read; the Host adds its own caches. */
    const REFRESH_MIN_MS = 500;

    /**
     * Shared state reader. The balance is account-wide, the cost is per Session,
     * so a snapshot is only valid for the Session it was read for: switching
     * Sessions drops the old cost immediately instead of showing another
     * Session's numbers while the new read is in flight.
     */
    function createBalanceStore() {
      let snapshot = {
        sessionId: undefined,
        status: 'idle',
        wallets: [],
        reason: undefined,
        at: 0,
        cost: undefined,
        pricing: undefined,
      };
      const listeners = new Set();
      let pending = null;
      let lastReadAt = 0;

      const publish = next => {
        snapshot = next;
        for (const listener of listeners) listener(snapshot);
      };

      async function read(sessionId, force) {
        const now = Date.now();
        const switched = snapshot.sessionId !== sessionId;
        if (switched) {
          pending = null;
          publish({
            sessionId,
            status: snapshot.wallets.length > 0 ? snapshot.status : 'loading',
            wallets: snapshot.wallets,
            reason: snapshot.reason,
            at: 0,
            cost: undefined,
            pricing: snapshot.pricing,
          });
        }
        if (!force && !switched && now - lastReadAt < REFRESH_MIN_MS) return;
        if (pending !== null) return pending;
        lastReadAt = now;

        const candidates = stateCandidates(sessionId);
        const emit = next => {
          if (snapshot.sessionId !== sessionId) return;
          publish({ ...next, sessionId });
        };

        if (candidates.length === 0) {
          emit({ status: 'unavailable', wallets: [], reason: 'no-endpoint', at: now, cost: undefined, pricing: snapshot.pricing });
          return;
        }
        if (snapshot.status !== 'ready') emit({ ...snapshot, status: 'loading' });

        const request = (async () => {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 9000);
          try {
            let payload;
            let reason = 'network';
            for (const url of candidates) {
              try {
                const response = await fetch(url, {
                  cache: 'no-store',
                  headers: { accept: 'application/json' },
                  signal: controller.signal,
                });
                if (!response.ok) {
                  reason = response.status === 401 ? 'unauthorized' : 'network';
                  continue;
                }
                const body = await response.json();
                if (body && typeof body === 'object' && body.balance !== undefined) {
                  payload = body;
                  break;
                }
                reason = 'failed';
              } catch (error) {
                reason = error && error.name === 'AbortError' ? 'timeout' : 'network';
              }
            }
            if (payload === undefined) {
              emit({ status: 'unavailable', wallets: [], reason, at: Date.now(), cost: undefined, pricing: snapshot.pricing });
              return;
            }
            const value = payload.balance || {};
            const cost = payload.cost;
            const pricing = payload.pricing;
            if (value.ok !== true) {
              emit({
                status: 'unavailable',
                wallets: [],
                reason: typeof value.reason === 'string' ? value.reason : 'failed',
                at: Date.now(),
                cost,
                pricing,
              });
              return;
            }
            const wallets = Array.isArray(value.wallets) ? value.wallets : [];
            if (wallets.length === 0) {
              emit({ status: 'unavailable', wallets: [], reason: 'no-wallet', at: Date.now(), cost, pricing });
              return;
            }
            emit({ status: 'ready', wallets, reason: undefined, at: Date.now(), cost, pricing });
          } catch (error) {
            emit({ status: 'unavailable', wallets: [], reason: 'failed', at: Date.now(), cost: undefined, pricing: snapshot.pricing });
          } finally {
            clearTimeout(timer);
          }
        })();
        pending = request;
        const settle = () => {
          if (pending === request) pending = null;
        };
        request.then(settle, settle);
        return request;
      }

      return {
        current: () => snapshot,
        subscribe(listener) {
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
          };
        },
        refresh: options => read(
          options && options.sessionId !== undefined ? options.sessionId : undefined,
          Boolean(options && options.force),
        ),
      };
    }

    function createEntry(store, translate) {
      function reasonLabel(reason) {
        switch (reason) {
          case 'missing-key': return translate('reasonMissingKey');
          case 'unauthorized': return translate('reasonUnauthorized');
          case 'network': return translate('reasonNetwork');
          case 'timeout': return translate('reasonTimeout');
          case 'no-endpoint': return translate('reasonNoEndpoint');
          case 'no-wallet': return translate('reasonNoWallet');
          case 'not-live': return translate('reasonNotLive');
          case 'no-session': return translate('reasonNotLive');
          case 'price-pending': return translate('reasonPricePending');
          case 'price-failed': return translate('reasonPriceFailed');
          default: return translate('reasonFailed');
        }
      }

      function balanceLabel(snapshot) {
        if (snapshot.status === 'ready') {
          const wallet = snapshot.wallets[0];
          return translate('pillBalance', { amount: money(walletTotal(wallet), currencySymbol(wallet.currency)) });
        }
        if (snapshot.status === 'loading' || snapshot.status === 'idle') {
          return translate('pillBalanceLoading');
        }
        return translate('pillBalanceUnknown');
      }

      function costView(snapshot, sessionId) {
        const value = snapshot.sessionId === sessionId ? snapshot.cost : undefined;
        if (value && value.ok === true) {
          return { exact: true, amount: Number(value.total) || 0, data: value, pending: false };
        }
        const pending = value === undefined
          && (snapshot.status === 'idle' || snapshot.status === 'loading');
        return { exact: false, amount: undefined, data: value, pending };
      }

      function Panel({ view, snapshot, position, panelRef }) {
        const ready = snapshot.status === 'ready';
        const wallet = ready ? snapshot.wallets[0] : undefined;
        const cells = [];
        const push = (key, label, value) => {
          cells.push(h('dt', { key: `${key}-l` }, label));
          cells.push(h('dd', { key: `${key}-v` }, value));
        };

        if (view.exact) {
          const data = view.data;
          const models = Array.isArray(data.models) ? data.models : [];
          if (models.length > 1) {
            // One line per model, carrying both its cost and its request count.
            models.forEach((model, index) => {
              push(`model-${index}`, index === 0 ? translate('modelLabel') : '', `${model.label} ${money(model.cost, '¥')}`
                + ` · ${translate('callsValue', { count: countText(model.calls) })}`);
            });
          } else {
            const selection = data.selection;
            if (models.length === 1) push('model', translate('modelLabel'), models[0].label);
            else if (selection && typeof selection.label === 'string') {
              push('model', translate('modelLabel'), selection.label);
            }
            push('calls', translate('callsLabel'), translate('callsValue', { count: countText(data.calls) }));
          }
          push('web', translate('webLabel'), translate('webValue', { count: countText(Number(data.toolRequests) || 0) }));
        } else {
          push('state', translate('statusLabel'), view.pending
            ? translate('balanceLoading')
            : reasonLabel(view.data && view.data.reason ? view.data.reason : 'not-live'));
        }

        if (ready && wallet !== undefined) {
          const walletSymbol = currencySymbol(wallet.currency);
          push('balance', translate('balanceLabel'), money(walletTotal(wallet), walletSymbol));
          if ((Number(wallet.granted) || 0) > 0) {
            push('bonus', translate('bonusLabel'), money(wallet.granted, walletSymbol));
          }
        } else {
          push('balance', translate('balanceLabel'), snapshot.status === 'loading' || snapshot.status === 'idle'
            ? translate('balanceLoading')
            : reasonLabel(snapshot.reason));
        }


        return h('div', {
          ref: panelRef,
          className: 'dshsc_panel',
          role: 'dialog',
          'aria-label': translate('panelTitle'),
          style: position || { visibility: 'hidden' },
        }, [
          h('div', { key: 'title', className: 'dshsc_title' }, [
            h('span', { key: 'label', className: 'dshsc_titleLabel' }, [
              h(Icon, { key: 'icon' }),
              translate('costTitle'),
            ]),
            h('span', { key: 'value', className: 'dshsc_titleValue' },
              view.exact ? money(view.amount, '¥') : '—'),
          ]),
          h('div', { key: 'rule', className: 'dshsc_rule', 'aria-hidden': true }),
          h('dl', { key: 'details', className: 'dshsc_details' }, cells),
        ]);
      }

      function SessionCostEntry(props) {
        const usage = props.useProjection('tokenUsage');
        const snapshot = React.useSyncExternalStore(store.subscribe, store.current, store.current);
        const [open, setOpen] = React.useState(false);
        const [position, setPosition] = React.useState(undefined);
        const rootRef = React.useRef(null);
        const panelRef = React.useRef(null);
        const view = costView(snapshot, props.sessionId);
        const sessionId = props.sessionId;

        const usageKey = usage
          ? [usage.uncachedInputTokens, usage.cacheReadTokens, usage.cacheWriteTokens, usage.outputTokens].join(':')
          : '';

        React.useEffect(() => {
          store.refresh({ sessionId });
          const timer = setInterval(() => store.refresh({ sessionId }), 300000);
          const onVisible = () => {
            if (document.visibilityState === 'visible') store.refresh({ sessionId });
          };
          document.addEventListener('visibilitychange', onVisible);
          return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', onVisible);
          };
        }, [sessionId]);

        React.useEffect(() => {
          // The other composer statistics move on this same event, so read the
          // new cost immediately instead of waiting for the next timed poll.
          if (usageKey !== '') store.refresh({ sessionId, force: true });
        }, [usageKey]);

        React.useEffect(() => {
          // Opening the panel is an explicit request for fresh numbers; the Host
          // still applies its own one-minute balance and pricing caches.
          if (open) store.refresh({ sessionId });
        }, [open, sessionId]);

        React.useLayoutEffect(() => {
          if (!open) {
            setPosition(undefined);
            return;
          }
          const place = () => {
            const element = rootRef.current;
            if (element === null) return;
            const rect = element.getBoundingClientRect();
            const width = Math.min(440, window.innerWidth - 24);
            const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
            setPosition({
              left: `${Math.round(left)}px`,
              bottom: `${Math.round(window.innerHeight - rect.top + 8)}px`,
            });
          };
          place();
          window.addEventListener('resize', place);
          window.addEventListener('scroll', place, true);
          return () => {
            window.removeEventListener('resize', place);
            window.removeEventListener('scroll', place, true);
          };
        }, [open]);

        React.useEffect(() => {
          if (!open) return;
          const onKeyDown = event => {
            if (event.key === 'Escape') setOpen(false);
          };
          const onPointerDown = event => {
            const target = event.target;
            if (!(target instanceof Node)) return;
            if (rootRef.current && rootRef.current.contains(target)) return;
            if (panelRef.current && panelRef.current.contains(target)) return;
            setOpen(false);
          };
          document.addEventListener('keydown', onKeyDown);
          document.addEventListener('pointerdown', onPointerDown, true);
          return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('pointerdown', onPointerDown, true);
          };
        }, [open]);

        // Match the shipped statistics pills: nothing until this Session has
        // produced tokens, and nothing while this Session's own cost is still in
        // flight, so the row appears together with the other two.
        const used = usage !== undefined && usage !== null
          && ((usage.uncachedInputTokens || 0) + (usage.cacheReadTokens || 0)
            + (usage.cacheWriteTokens || 0) + (usage.outputTokens || 0)) > 0;
        if (!used || view.data === undefined || view.data === null) return null;

        const costText = view.exact ? translate('pillCost', { amount: money(view.amount, '¥') }) : '—';
        const label = `${costText} ${translate('pillSeparator')} ${balanceLabel(snapshot)}`;

        const panelProps = { view, snapshot, position, panelRef };
        const panel = open
          ? (ReactDOM && typeof ReactDOM.createPortal === 'function'
            ? ReactDOM.createPortal(h(Panel, { ...panelProps, key: 'panel' }), document.body, 'panel')
            : h(Panel, { ...panelProps, key: 'panel' }))
          : null;

        return h('span', {
          ref: rootRef,
          className: 'dshsc_anchor',
          'data-composer-stat': 'session-cost',
        }, [
          h('button', {
            key: 'button',
            type: 'button',
            className: 'dshsc_pill',
            'aria-haspopup': 'dialog',
            'aria-expanded': open,
            'aria-label': `${translate('openDetails')}: ${label}`,
            onClick: () => setOpen(!open),
          }, [
            h(Icon, { key: 'icon', className: 'dshsc_icon' }),
            h('span', { key: 'label', className: 'dshsc_label' }, label),
          ]),
          panel,
        ]);
      }

      SessionCostEntry.displayName = 'SessionCostEntry';
      return SessionCostEntry;
    }

    function Icon(props) {
      return h('svg', {
        viewBox: '0 0 64 64',
        className: props && props.className ? props.className : 'dshsc_icon',
        'aria-hidden': true,
        style: { display: 'block' },
      }, [
        h('circle', { key: 'c', cx: 32, cy: 32, r: 24, fill: 'none', stroke: 'currentColor', strokeWidth: 7 }),
        h('path', { key: 'y', d: 'M19 17 32 29 45 17', fill: 'none', stroke: 'currentColor', strokeWidth: 7, strokeLinecap: 'round', strokeLinejoin: 'round' }),
        h('path', { key: 's', d: 'M32 29v18', fill: 'none', stroke: 'currentColor', strokeWidth: 7, strokeLinecap: 'round' }),
        h('path', { key: 'b', d: 'M23 38h18', fill: 'none', stroke: 'currentColor', strokeWidth: 7, strokeLinecap: 'round' }),
      ]);
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => {
          try {
            return ctx.locale.register(NS, DICTS);
          } catch (error) {
            return () => {};
          }
        }, 'session-cost: dictionaries');

        ctx.effect(() => {
          const tag = document.createElement('style');
          tag.dataset.plugin = '@dawn0608/dsh-session-cost';
          tag.dataset.pluginCss = '@dawn0608/dsh-session-cost/pill.css';
          tag.textContent = CSS;
          document.head.appendChild(tag);
          return () => {
            tag.remove();
          };
        }, 'session-cost: styles');

        let bound;
        try {
          bound = ctx.locale.bind(NS);
        } catch (error) {
          bound = null;
        }
        const fallback = () => {
          let active = 'en';
          try {
            active = ctx.locale.getSnapshot().active || 'en';
          } catch (error) {
            active = 'en';
          }
          return String(active).toLowerCase().startsWith('zh') ? DICTS.zh : DICTS.en;
        };
        const translate = (key, params) => {
          let text;
          if (bound !== null) {
            try {
              text = bound(key, params);
            } catch (error) {
              text = undefined;
            }
          }
          if (typeof text !== 'string' || text === key) {
            const dict = fallback();
            text = format(dict[key] !== undefined ? dict[key] : DICTS.en[key], params);
          }
          return text;
        };

        const store = createBalanceStore();
        const Entry = createEntry(store, translate);

        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
          name: 'conversation.composer.dock',
          id: 'session-cost',
          order: 2,
        }, Entry));
      },
    };
  },
});
