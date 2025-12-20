// components/AdSlot.js

import { useEffect } from 'react';

const AD_NETWORK_CODE = '/23326444898';
const AD_UNIT_CODE = 'HFWAM';

const AdSlot = ({ slotId }) => {
    useEffect(() => {
        if (typeof window.googletag !== 'undefined' && window.googletag.cmd) {
            window.googletag.cmd.push(function() {
                if (window.googletag.slots && window.googletag.slots.some(slot => slot.getSlotElementId() === slotId)) {
                    window.googletag.display(slotId);
                    return;
                }

                const mapping = window.googletag.sizeMapping()
                    .addSize([1024, 0], [[728, 90], [336, 280], [300, 250]])
                    .addSize([768, 0], [[728, 90], [336, 280], [300, 250]])
                    .addSize([0, 0], [[300, 250], [320, 100], [320, 50]])
                    .build();

                window.googletag.defineSlot(
                    `${AD_NETWORK_CODE}/${AD_UNIT_CODE}`,
                    [[300, 250], [336, 280], [728, 90], [320, 100]],
                    slotId
                )
                .defineSizeMapping(mapping)
                .addService(window.googletag.pubads());

                window.googletag.display(slotId);
            });
        }
    }, [slotId]);

    return (
        // 💡 修正点: 固定サイズ(min-width等)を全廃止。Flexboxで中央配置のみ行う。
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            margin: '40px auto'
        }}>
            {/* 中身（広告）に合わせてサイズが変わるようにする */}
            <div id={slotId}></div>
        </div>
    );
};

export default AdSlot;
