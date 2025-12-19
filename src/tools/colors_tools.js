const { getColors } = require('../calendar');

function registerColorsTools(server, checkAuth) {
    server.tool(
        'get_colors',
        {},
        async () => {
            const authError = await checkAuth();
            if (authError) return authError;

            try {
                const colors = await getColors();
                return {
                    content: [{ type: 'text', text: JSON.stringify(colors, null, 2) }],
                };
            } catch (e) {
                return {
                    content: [{ type: 'text', text: `Error: ${e.message}` }],
                    isError: true,
                };
            }
        }
    );
}

module.exports = { registerColorsTools };
