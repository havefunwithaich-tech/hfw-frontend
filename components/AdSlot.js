import { useEffect } from 'react';
import { useRouter } from 'next/router';

const AD_NETWORK_CODE = '/23326444898';
const AD_UNIT_CODE = 'HFWAM';
const AD_SIZES_ALL = [[300, 250],  [728, 90],  [970, 250]];

const AdSlot = ({ slotId }) => {
    const router = useRouter(); 
    
    useEffect(() => {
        if (typeof window.googletag !== 'undefined' && window.googletag.cmd) {
            window.googletag.cmd.push(function() {
                if (window.googletag.slots && window.googletag.slots.some(slot => slot.getSlotElementId() === slotId)) {
                    window.googletag.display(slotId); 
                    return;
                }

                const mapping = window.googletag.sizeMapping()
                    .addSize([971, 0], [[970, 250]])
                    .addSize([769, 0], [[728, 90]])
                    .addSize([0, 0], [[300, 250]])
                    .build();

                window.googletag.defineSlot(
                    `${AD_NETWORK_CODE}/${AD_UNIT_CODE}`, 
                    AD_SIZES_ALL,
                    slotId
                )
                .defineSizeMapping(mapping)
                .addService(window.googletag.pubads());
                
                window.googletag.display(slotId);
            });
        }
    }, [slotId, router.asPath]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '30px auto', minHeight: '50px' }}>
            <div id={slotId}></div>
        </div>
    );
};

export default AdSlot;