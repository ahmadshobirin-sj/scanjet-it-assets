export const Wave = ({ backgroundColor = 'bg-blue-600', waveColor = 'white', waveOpacity = [0.7, 0.5, 0.3, 1], waveHeight = 'h-[100px]' }) => {
    return (
        <div className={`relative w-full ${backgroundColor}`}>
            <svg
                className={`relative w-full ${waveHeight} -mt-px`}
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 24 150 28"
                preserveAspectRatio="none"
                shapeRendering="auto"
            >
                <defs>
                    <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
                </defs>
                <g>
                    <use xlinkHref="#gentle-wave" x="48" y="0" fill={waveColor} opacity={waveOpacity[0]} className="animate-wave wave-1" />
                    <use xlinkHref="#gentle-wave" x="48" y="3" fill={waveColor} opacity={waveOpacity[1]} className="animate-wave wave-2" />
                    <use xlinkHref="#gentle-wave" x="48" y="5" fill={waveColor} opacity={waveOpacity[2]} className="animate-wave wave-3" />
                    <use xlinkHref="#gentle-wave" x="48" y="7" fill={waveColor} opacity={waveOpacity[3]} className="animate-wave wave-4" />
                </g>
            </svg>
        </div>
    );
};
