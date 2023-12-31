import { useAuth0 } from "@auth0/auth0-react";
import { getScopedData } from "./lib/api.mts";
import { useEffect, useRef, useState } from "react";
import { Stack } from "@mui/material";
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    gantt: { displayMode: 'compact', axisFormat: '%b' },
});

declare global {
    interface Window { onClickVoyage: any; }
}

window.onClickVoyage = (boat: number, title: string) => console.log('onClickVoyage', boat, title);

interface Voyage {
    start: string
    end: string
    title: string
    type: string
    boat: {
        name: string
        oga_no: number
    }
}

function section(title: string, voyages: Voyage[]) {
    const tasks = voyages.map((voyage) => {
        const { start, end, title, boat } = voyage;
        return `${title} on ${boat.name}: b${boat.oga_no}, ${start}, ${end}`;
    });
    const clicks = voyages.map((voyage) => {
        const { title, boat } = voyage;
        return `click b${boat.oga_no} call onClickVoyage(${boat.oga_no}, "${title}")`
    });
    return `section ${title}
    ${tasks.join('\n')}
    ${clicks.join('\n')}
    `;
}

function convert(allVoyages: Voyage[]) {
    // console.log('convert', allVoyages);
    const voyages = allVoyages.filter((v) => v.start !== '' && v.end !== '');
    const types = voyages.reduce((p, v) => {
        p.add(v.type);
        return p;
    }, new Set<string>());
    const sections = [...types].map((type) => section(type, voyages.filter((v) => v.type === type)));
    const header = `gantt
    tickInterval 1month
    title Our 2024 Voyages
    dateFormat YYYY-MM-DD`;
    return `${header}
    section -
    AGM: milestone, m1, 2024-01-14, 0d
    Hogmanay: milestone, m2, 2024-12-31, 0d
    ${sections.join('\n')}
    `;
}

function Timeline({ voyages, onClickVoyage }: { voyages: any[], onClickVoyage: Function }) {
    const chartRef = useRef<HTMLPreElement>(null);

    window.onClickVoyage = onClickVoyage;

    useEffect(() => {
        async function render() {
            if (chartRef.current) {
                const { svg, bindFunctions } = await mermaid.render('voyages', convert(voyages));
                chartRef.current.innerHTML = svg; 
                bindFunctions?.(chartRef.current);
            }
        }
        render();
    }, [chartRef, voyages]);

    return <pre ref={chartRef}></pre>;
}

export default function AYearOfEvents() {
    const { user, getAccessTokenSilently } = useAuth0();
    const [voyages, setVoyages] = useState<any[]>([]);
    const [token, setToken] = useState<string | undefined>();

    useEffect(() => {
        async function getToken() {
            if (!token) {
                const tok = await getAccessTokenSilently();
                setToken(tok);
            }
        }
        getToken();
    }, [token]);

    function handleClickVoyage(boat: number, title: string) {
        console.log('onClickVoyage', boat, title, user);
    };

    useEffect(() => {

        async function get() {
            const pub = await getScopedData('public', 'voyage');
            const priv = await getScopedData('member', 'voyage', undefined, token);
            setVoyages([...pub, ...priv]);
        }
        get();
    }, [token]);

    return <Stack>
        <Timeline voyages={voyages} onClickVoyage={handleClickVoyage} />
    </Stack>;
}