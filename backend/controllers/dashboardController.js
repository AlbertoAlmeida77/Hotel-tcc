const pool = require("../config/db");

async function getDashboard(req, res) {
    try {
        const [[quartosStats]] = await pool.query(`
            SELECT
                COUNT(*) AS total_quartos,
                SUM(CASE WHEN status = 'disponivel' THEN 1 ELSE 0 END) AS quartos_disponiveis,
                SUM(CASE WHEN status = 'ocupado'    THEN 1 ELSE 0 END) AS quartos_ocupados,
                SUM(CASE WHEN status = 'manutencao' THEN 1 ELSE 0 END) AS quartos_manutencao
            FROM quartos
        `);

        const [[reservasStats]] = await pool.query(`
            SELECT
                COUNT(*) AS total_reservas,
                SUM(CASE WHEN situacao = 'ativa'       THEN 1 ELSE 0 END) AS reservas_ativas,
                SUM(CASE WHEN situacao = 'pendente'    THEN 1 ELSE 0 END) AS reservas_pendentes,
                SUM(CASE WHEN situacao = 'finalizada'  THEN 1 ELSE 0 END) AS reservas_finalizadas,
                SUM(CASE WHEN situacao = 'cancelada'   THEN 1 ELSE 0 END) AS reservas_canceladas
            FROM reservas
        `);

        const [[financeiroStats]] = await pool.query(`
            SELECT
                SUM(
                    CASE
                        WHEN MONTH(data_entrada) = MONTH(CURDATE())
                         AND YEAR(data_entrada)  = YEAR(CURDATE())
                         AND situacao != 'cancelada'
                        THEN DATEDIFF(data_saida, data_entrada) * valor_diaria
                        ELSE 0
                    END
                ) AS receita_mes,
                SUM(
                    CASE
                        WHEN situacao != 'cancelada'
                        THEN DATEDIFF(data_saida, data_entrada) * valor_diaria
                        ELSE 0
                    END
                ) AS receita_total
            FROM reservas
        `);

        const [[agendaStats]] = await pool.query(`
            SELECT
                SUM(CASE WHEN DATE(data_entrada) = CURDATE()
                          AND situacao NOT IN ('cancelada','finalizada') THEN 1 ELSE 0 END) AS entradas_hoje,
                SUM(CASE WHEN DATE(data_saida)   = CURDATE()
                          AND situacao NOT IN ('cancelada','finalizada') THEN 1 ELSE 0 END) AS saidas_hoje,
                SUM(CASE WHEN data_entrada BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
                          AND situacao NOT IN ('cancelada','finalizada') THEN 1 ELSE 0 END) AS entradas_proximos_7_dias,
                SUM(CASE WHEN data_saida   BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
                          AND situacao NOT IN ('cancelada','finalizada') THEN 1 ELSE 0 END) AS saidas_proximos_7_dias
            FROM reservas
        `);

        const total   = Number(quartosStats.total_quartos) || 0;
        const ocupados = Number(quartosStats.quartos_ocupados) || 0;
        const taxa_ocupacao = total > 0 ? Number(((ocupados / total) * 100).toFixed(1)) : 0;

        res.json({
            quartos: {
                total,
                disponiveis: Number(quartosStats.quartos_disponiveis) || 0,
                ocupados,
                manutencao:  Number(quartosStats.quartos_manutencao)  || 0,
                taxa_ocupacao
            },
            reservas: {
                total:       Number(reservasStats.total_reservas)        || 0,
                ativas:      Number(reservasStats.reservas_ativas)       || 0,
                pendentes:   Number(reservasStats.reservas_pendentes)    || 0,
                finalizadas: Number(reservasStats.reservas_finalizadas)  || 0,
                canceladas:  Number(reservasStats.reservas_canceladas)   || 0
            },
            financeiro: {
                receita_mes:   Number(financeiroStats.receita_mes)   || 0,
                receita_total: Number(financeiroStats.receita_total) || 0
            },
            agenda: {
                entradas_hoje:             Number(agendaStats.entradas_hoje)             || 0,
                saidas_hoje:               Number(agendaStats.saidas_hoje)               || 0,
                entradas_proximos_7_dias:  Number(agendaStats.entradas_proximos_7_dias)  || 0,
                saidas_proximos_7_dias:    Number(agendaStats.saidas_proximos_7_dias)    || 0
            }
        });
    } catch (erro) {
        res.status(500).json({
            mensagem: "Erro ao buscar dados do dashboard",
            erro: erro.message
        });
    }
}

module.exports = { getDashboard };
