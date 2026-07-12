import * as reportService from '../services/report.service.js';

export async function getFleetReport(req, res, next) {
    try {
        const data = await reportService.getFleetReport();
        return res.status(200).json({
            success: true,
            message: 'Fleet report generated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getDriverReport(req, res, next) {
    try {
        const data = await reportService.getDriverReport();
        return res.status(200).json({
            success: true,
            message: 'Driver report generated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getTripReport(req, res, next) {
    try {
        const data = await reportService.getTripReport();
        return res.status(200).json({
            success: true,
            message: 'Trip report generated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getExpenseReport(req, res, next) {
    try {
        const data = await reportService.getExpenseReport();
        return res.status(200).json({
            success: true,
            message: 'Expense report generated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function getOperationalCostReport(req, res, next) {
    try {
        const data = await reportService.getOperationalCostReport();
        return res.status(200).json({
            success: true,
            message: 'Operational cost report generated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
}

export async function exportCSV(req, res, next) {
    try {
        const type = req.query.type || 'fleet';
        const csvContent = await reportService.compileCSV(type.toLowerCase());
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${type}-report.csv`);
        return res.status(200).send(csvContent);
    } catch (error) {
        next(error);
    }
}

export async function exportPDF(req, res, next) {
    try {
        const type = req.query.type || 'fleet';
        const pdfBuffer = await reportService.compilePDF(type.toLowerCase());
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${type}-report.pdf`);
        return res.status(200).send(pdfBuffer);
    } catch (error) {
        next(error);
    }
}
