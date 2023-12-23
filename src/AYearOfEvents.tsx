import { useAuth0 } from "@auth0/auth0-react";
import { getScopedData } from "./lib/api.mts";
import { useEffect, useRef, useState } from "react";
import { Stack, Typography } from "@mui/material";
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: false, gantt: { displayMode: 'compact', axisFormat: '%b' } });

interface Voyage {
    start: string
    end: string
    title: string
    type: string
    boat: {
        name: string
    }
}

function section(title: string, voyages: Voyage[]) {
    const tasks = voyages.map((voyage, index) => {
        const { start, end, title, boat } = voyage;
        const tag = `a${index}`;
        return `${title} on ${boat.name}: ${tag}, ${start}, ${end}`;
    });
    return `section ${title}\n${tasks.join('\n')}`;
}

function convert(voyages: Voyage[]) {
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

function Timeline({ voyages }: { voyages: any[] }) {
    const chartRef = useRef<HTMLPreElement>(null);

    useEffect(() => {
        async function render() {
            if (chartRef.current) {
                const { svg } = await mermaid.render('voyages', convert(voyages));
                chartRef.current.innerHTML = svg;    
            }
        }
        render();
    }, [chartRef, voyages]);

    return <pre ref={chartRef}></pre>;
}

export default function AYearOfEvents() {
    const { getAccessTokenSilently } = useAuth0();
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

    useEffect(() => {

        async function get() {
            const pub = await getScopedData('public', 'voyage');
            const priv = await getScopedData('member', 'voyage', undefined, token);
            setVoyages([...pub, ...priv]);
        }
        get();
    }, [token]);

    return <Stack>
        <Timeline voyages={voyages} />
    </Stack>;
}