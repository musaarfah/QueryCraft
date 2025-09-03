import json
from . import schema_loader

def load_db_schemas(db_configs, cache_path="structured_schema.json"):
    """
    Given db_configs.json (connection info),
    return a dict of {db_name: schema_dict} with tables/columns.
    """
    all_schemas = {}
    for db_name, config in db_configs.items():
        try:
            schema = schema_loader.extract_schema_to_yaml(config)
            all_schemas[db_name] = schema
        except Exception as e:
            print(f"[Schema Load Error] {db_name}: {e}")
    # Optionally save to file for caching
    with open(cache_path, "w") as f:
        json.dump(all_schemas, f, indent=2)
    return all_schemas
