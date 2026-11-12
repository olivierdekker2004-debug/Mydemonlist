
import { round, score } from './score.js';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabase verbinding
const supabase = createClient(
    'https://aqkrtixtxwtqqabeeghw.supabase.co',
    'sb_publishable_Y3POVCyEo2Hr_iUAI7Td2A_lkW5IYQz'
);

/**
 * Levels rechtstreeks uit Supabase ophalen.
 */
export async function fetchList() {
    try {
        const { data, error } = await supabase
            .from('levels')
            .select(`
                id,
                gd_level_id,
                name,
                author,
                creators,
                verifier,
                verification,
                percent_to_qualify,
                password,
                position,
                is_active,
                records (
                    id,
                    progress,
                    video_url,
                    hz,
                    status,
                    players (
                        username
                    )
                )
            `)
            .eq('is_active', true)
            .order('position', { ascending: true });

        if (error) throw error;

        return data.map((level) => {
            const records = (level.records || [])
                .filter((record) => record.status === 'approved')
                .map((record) => ({
                    user: record.players?.username || 'Unknown',
                    link: record.video_url,
                    percent: Number(record.progress),
                    hz: record.hz,
                }))
                .sort((a, b) => b.percent - a.percent);

            return [
                {
                    ...level,
                    id: level.gd_level_id ?? level.id,
                    path: String(level.id),
                    percentToQualify: Number(level.percent_to_qualify),
                    records,
                },
                null,
            ];
        });
    } catch (error) {
        console.error('Failed to load Supabase list:', error);
        return null;
    }
}

/**
 * Editors voorlopig uit het bestaande JSON-bestand laden.
 */
export async function fetchEditors() {
    try {
        const result = await fetch('./data/_editors.json');

        if (!result.ok) {
            throw new Error(`HTTP ${result.status}`);
        }

        return await result.json();
    } catch (error) {
        console.error('Failed to load editors:', error);
        return null;
    }
}

/**
 * Leaderboard berekenen op basis van de levels en records.
 */
export async function fetchLeaderboard() {
    const list = await fetchList();

    if (!list) {
        return [[], ['Failed to load list']];
    }

    const scoreMap = {};
    const errs = [];

    list.forEach(([level, err], rank) => {
        if (err || !level) {
            errs.push(err);
            return;
        }

        const verifier = Object.keys(scoreMap).find(
            (u) => u.toLowerCase() === level.verifier.toLowerCase()
        ) || level.verifier;

        scoreMap[verifier] ??= {
            verified: [],
            completed: [],
            progressed: [],
        };

        scoreMap[verifier].verified.push({
            rank: rank + 1,
            level: level.name,
            score: score(rank + 1, 100, level.percentToQualify),
            link: level.verification,
        });

        level.records.forEach((record) => {
            const user = Object.keys(scoreMap).find(
                (u) => u.toLowerCase() === record.user.toLowerCase()
            ) || record.user;

            scoreMap[user] ??= {
                verified: [],
                completed: [],
                progressed: [],
            };

            const { completed, progressed } = scoreMap[user];

            if (record.percent === 100) {
                completed.push({
                    rank: rank + 1,
                    level: level.name,
                    score: score(rank + 1, 100, level.percentToQualify),
                    link: record.link,
                });
            } else {
                progressed.push({
                    rank: rank + 1,
                    level: level.name,
                    percent: record.percent,
                    score: score(
                        rank + 1,
                        record.percent,
                        level.percentToQualify
                    ),
                    link: record.link,
                });
            }
        });
    });

    const res = Object.entries(scoreMap).map(([user, scores]) => {
        const { verified, completed, progressed } = scores;

        const total = [verified, completed, progressed]
            .flat()
            .reduce((prev, cur) => prev + cur.score, 0);

        return {
            user,
            total: round(total),
            ...scores,
        };
    });

    return [res.sort((a, b) => b.total - a.total), errs];
}
