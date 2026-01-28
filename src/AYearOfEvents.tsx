import { useAuth0 } from "@auth0/auth0-react";
import { getScopedData } from "./lib/boatregister-api.mts";
import { useEffect, useRef, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from "@mui/material";
import mermaid from 'mermaid';
import VoyageCard, { Voyage } from "./VoyageCard";
import { Temporal } from '@js-temporal/polyfill';

mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    gantt: { displayMode: 'compact', axisFormat: '%b' },
});

declare global {
    interface Window { onClickVoyage: any; }
}

// window.onClickVoyage = (boat: number, title: string) => console.log('onClickVoyage', boat, title);

function tag(v: Voyage) {
    return `v${v.boat.oga_no}${v.title.replace(/ /g, '')}`;
}

function section(title: string, voyages: Voyage[]) {
    const tasks = voyages.map((voyage) => {
        const { start, end, title, boat } = voyage;
        return `${title} on ${boat.name}: ${tag(voyage)}, ${start}, ${end}`;
    });
    const clicks = voyages.map((voyage) => {
        const { title, boat } = voyage;
        return `click ${tag(voyage)} call onClickVoyage(${boat.oga_no}, "${title}")`
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
    title Our ${new Date().getFullYear()} Voyages
    dateFormat YYYY-MM-DD`;
    const now = Temporal.Now.zonedDateTimeISO();
    const next = now.getTimeZoneTransition('next') || now;
    const then = next.add({ days: 10 }) || now;
    const after = then.getTimeZoneTransition('next') || now;

    return `${header}
    section -
    Summer: milestone, m1, ${next.toPlainDate().toString()}, 0d
    Winter: milestone, m2, ${after.toPlainDate().toString()}, 0d
    ${sections.join('\n')}
    `;
}

function Timeline({ voyages, onClickVoyage }: { voyages: any[], onClickVoyage: Function }) {
    const chartRef = useRef<HTMLPreElement>(null);

    window.onClickVoyage = (oga_no: string, title: string) => onClickVoyage(Number(oga_no), title);

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
    const [voyage, setVoyage] = useState<Voyage>();
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
            const priv: any[] = await getScopedData('member', 'voyage', undefined, token);
            const vis = priv.filter((v) => v.visibility !== 'hidden');
            const start = new Date().toISOString().split('T')[0];
            const endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 1);
            const end = endDate.toISOString().split('T')[0];
            const inrange = [...pub, ...vis].filter((v) => v.start >= start && v.end <= end);
            setVoyages(inrange.map((v: any) => {
                const { member, ...rest } = v;
                return { organiserGoldId: member, ...rest };
            }));
        }
        get();
    }, [token]);

    function handleClickVoyage(oga_no: number, title: string) {
        const selected = voyages.find((v) => v.title === title && v.boat.oga_no === oga_no);
        setVoyage(selected);
    };

    function handleClose() {
        setVoyage(undefined);
    }

    return <Stack>
        <Timeline voyages={voyages} onClickVoyage={handleClickVoyage} />
        <Dialog open={!!voyage}>
            <DialogTitle>Fancy this {user?.given_name ?? ''}?</DialogTitle>
                <DialogContent>
                {voyage ? <VoyageCard voyage={voyage} /> : '' }
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Done</Button>
                </DialogActions>
        </Dialog>
    </Stack>;
}