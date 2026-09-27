CREATE TABLE `atividade` (
	`id` text NOT NULL,
	`tipo` text NOT NULL,
	`due` text,
	`nome` text NOT NULL,
	`materia_nome` text NOT NULL,
	`semestre` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `atividade_id_idx` ON `atividade` (`id`);
