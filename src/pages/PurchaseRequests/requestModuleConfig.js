export const resolvePurchaseRequestModule = (pathname = '') => {
    if (pathname.startsWith('/production/purchase-requests')) {
        return {
            apiBase: '/production-requests',
            sourceSection: 'production',
            defaultDepartment: 'Production',
            moduleQuery: 'production-pr'
        };
    }

    if (pathname.startsWith('/lamination/purchase-requests')) {
        return {
            apiBase: '/lamination-requests',
            sourceSection: 'lamination',
            defaultDepartment: 'Lamination',
            moduleQuery: 'lamination-pr'
        };
    }

    return {
        apiBase: '/requests',
        sourceSection: 'procurement',
        defaultDepartment: 'Procurement',
        moduleQuery: ''
    };
};
