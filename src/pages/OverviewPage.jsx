import { useMemo } from 'react';
import { useDashboardQuery } from '../hooks/useDashboardQuery';
import StatsGrid from '../components/StatsGrid';
import TopEndpoints from '../components/TopEndpoints';
import { ApiHitsChart, StatusDistributionChart } from '../components/charts';
import { PageStatus } from '../components/ui';
import styles from '../styles/modules/pages/PageComponents.module.scss';

export function OverviewPage() {
    const { data, isPending, error, refetch } = useDashboardQuery();

    const dashboardPayload = data?.data ?? {};
    const stats = dashboardPayload.stats ?? null;
    const topEndpoints = dashboardPayload.topEndpoints ?? [];
    
    // Handle both correct spelling and the backend typo just in case
    const timeSeriesData = dashboardPayload.recentActivity ?? dashboardPayload.recentActitivy ?? [];

    const statusData = useMemo(() => {
        if (!stats) return null;
        return {
            labels: ['Success (2xx)', 'Errors (4xx/5xx)'],
            values: [stats.successHits ?? 0, stats.errorHits ?? 0],
        };
    }, [stats]);

    if (isPending || error || !data) {
        return (
            <PageStatus
                isLoading={isPending || !data}
                error={error}
                onRetry={refetch}
                loadingText="Loading dashboard..."
                errorText="Failed to load dashboard data"
            />
        );
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h2>Overview</h2>
                <p>Welcome to your API monitoring dashboard</p>
            </div>

            <StatsGrid stats={stats} />

            <div className={styles.gridTwoCols}>
                {/* Pass timeSeriesData or stats depending on what your ApiHitsChart component expects */}
                <ApiHitsChart stats={stats} timeSeries={timeSeriesData} />
                <StatusDistributionChart data={statusData} />
            </div>

            <TopEndpoints endpoints={topEndpoints} />
        </div>
    );
}