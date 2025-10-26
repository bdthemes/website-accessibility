/**
 * Accessibility Scanner for WCAG 2.1 AA compliance
 */
import { accessibilityChecks } from './accessibilityChecks';

/**
 * Run all accessibility checks and return results
 */
export const scanPageForAccessibilityIssues = () => {
    const results = {
        scanTime: new Date().toISOString(),
        url: window.location.href,
        totalIssues: 0,
        categories: []
    };

    // Process each category and its checks
    results.categories = accessibilityChecks.categories.map(category => {
        const categoryResults = {
            ...category,
            checks: []
        };

        category.checks.forEach(check => {
            try {
                const result = check.validate(document);
                if (!result.passed) {
                    categoryResults.checks.push({
                        id: check.id,
                        title: check.title,
                        description: check.description,
                        severity: check.severity,
                        fixSuggestion: check.fixSuggestion,
                        ...result
                    });
                }
            } catch (error) {
                console.error(`Error running check ${check.id}:`, error);
            }
        });

        results.totalIssues += categoryResults.checks.length;
        return categoryResults;
    }).filter(category => category.checks.length > 0);

    return results;
};

/**
 * Run the accessibility scan and handle any errors
 */
export const runAccessibilityScan = () => {
    try {
        return scanPageForAccessibilityIssues();
    } catch (error) {
        console.error('Error running accessibility scan:', error);
        return {
            error: 'Failed to complete accessibility scan',
            details: error.message,
            scanTime: new Date().toISOString(),
            url: window.location.href,
            totalIssues: 0,
            categories: []
        };
    }
};

/**
 * Get the list of all available checks
 */
export const getAvailableChecks = () => {
    return accessibilityChecks.categories.flatMap(category => 
        category.checks.map(check => ({
            id: check.id,
            title: check.title,
            category: category.title,
            description: check.description
        }))
    );
};
