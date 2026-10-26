// Rutas: asocia método + URL con su controlador
const { Router } = require('express');
const controller = require('../controllers/tarea.controller');
const asyncHandler = require('../middlewares/asyncHandler');

const router = Router();

router.get('/', asyncHandler(controller.listar));
router.get('/:id', asyncHandler(controller.obtener));
router.post('/', asyncHandler(controller.crear));
router.put('/:id', asyncHandler(controller.actualizar));
router.delete('/:id', asyncHandler(controller.eliminar));

module.exports = router;
