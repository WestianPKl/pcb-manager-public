CREATE TABLE "devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"serial_number" varchar(255) NOT NULL,
	"claim_token" varchar(255),
	"claimed_at" timestamp with time zone,
	"description" varchar(255),
	"pcb_id" uuid NOT NULL,
	"created_by_id" uuid NOT NULL,
	"updated_by_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "devices_serial_number_unique" UNIQUE("serial_number"),
	CONSTRAINT "devices_claim_token_unique" UNIQUE("claim_token")
);
--> statement-breakpoint
CREATE TABLE "pcb" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"revision" varchar(45) NOT NULL,
	"top_url" varchar(255),
	"bottom_url" varchar(255),
	"comment" varchar(255),
	"verified" boolean DEFAULT false,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_pcb" UNIQUE("name","revision")
);
--> statement-breakpoint
CREATE TABLE "pcb_bom_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pcb_id" uuid NOT NULL,
	"inventory_id" uuid NOT NULL,
	"qty_per_board" integer NOT NULL,
	"designators" varchar(255),
	"value_spec" varchar(255),
	"allow_substitute" boolean DEFAULT false,
	"comment" varchar(255),
	"created_by_id" uuid,
	"updated_by_id" uuid,
	CONSTRAINT "unique_pcb_bom_item" UNIQUE("pcb_id","inventory_id")
);
--> statement-breakpoint
CREATE TABLE "production_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"production_order_id" uuid NOT NULL,
	"inventory_id" uuid NOT NULL,
	"qty_per_board" integer NOT NULL,
	"required_qty_total" integer NOT NULL,
	"consumed_qty" integer DEFAULT 0,
	"allow_substitute" boolean DEFAULT false,
	"designators" varchar(255),
	"status" varchar(20) DEFAULT 'ok' NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_production_order_item" UNIQUE("production_order_id","inventory_id")
);
--> statement-breakpoint
CREATE TABLE "production_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pcb_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"status" varchar(50) DEFAULT 'planned' NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_pcb_fk" FOREIGN KEY ("pcb_id") REFERENCES "public"."pcb"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_created_by_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_updated_by_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pcb" ADD CONSTRAINT "pcb_project_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pcb" ADD CONSTRAINT "pcb_created_by_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pcb" ADD CONSTRAINT "pcb_updated_by_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pcb_bom_items" ADD CONSTRAINT "bom_pcb_fk" FOREIGN KEY ("pcb_id") REFERENCES "public"."pcb"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pcb_bom_items" ADD CONSTRAINT "bom_inventory_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pcb_bom_items" ADD CONSTRAINT "bom_created_by_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pcb_bom_items" ADD CONSTRAINT "bom_updated_by_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_order_items" ADD CONSTRAINT "order_items_order_fk" FOREIGN KEY ("production_order_id") REFERENCES "public"."production_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_order_items" ADD CONSTRAINT "order_items_inventory_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_order_items" ADD CONSTRAINT "order_items_created_by_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_order_items" ADD CONSTRAINT "order_items_updated_by_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_pcb_fk" FOREIGN KEY ("pcb_id") REFERENCES "public"."pcb"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_created_by_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_updated_by_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_updated_by_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "devices_pcb_idx" ON "devices" USING btree ("pcb_id");--> statement-breakpoint
CREATE INDEX "pcb_project_idx" ON "pcb" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "pcb_created_by_idx" ON "pcb" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "pcb_updated_by_idx" ON "pcb" USING btree ("updated_by_id");--> statement-breakpoint
CREATE INDEX "bom_pcb_idx" ON "pcb_bom_items" USING btree ("pcb_id");--> statement-breakpoint
CREATE INDEX "bom_inventory_idx" ON "pcb_bom_items" USING btree ("inventory_id");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "production_order_items" USING btree ("production_order_id");--> statement-breakpoint
CREATE INDEX "order_items_inventory_idx" ON "production_order_items" USING btree ("inventory_id");--> statement-breakpoint
CREATE INDEX "production_orders_pcb_idx" ON "production_orders" USING btree ("pcb_id");