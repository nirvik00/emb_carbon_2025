import ifcopenshell.geom as geom
import ifcopenshell.util.element
import pymongo
import time


settings = geom.settings()
settings.set(settings.USE_WORLD_COORDS, True)
# model = ifcopenshell.open("data/185171.ifc")
# office:
# fn = "C:\\Users\\nsdev\\code\\py_proj\\ifc\\OFFICE\\Office_A.ifc"
fn = "C:\\Users\\nsdev\\code\\web-dev\\aectech25\\backend\\Kentwood-Community Center_2025_Jason.ifc"
model = ifcopenshell.open(fn)

# MONGODB_URI = "mongodb+srv://imnirviksaha_db_user:3SIX8nj3QWXmDE2B@cluster0.yztu7ll.mongodb.net/model-query?retryWrites=true&w=majority&appName=Cluster0"
MONGODB_URI = "mongodb://localhost:27017"
db_client = pymongo.MongoClient(MONGODB_URI)
_db = db_client["aecTechBoston2025"]
# collection = db["biocontainment_185171_ifc"]
_collection = _db["kentwood2"]

# for biocontainment
# element_types = ['IfcCurtainWall', 'IfcDoor', 'IfcRailing', 'IfcRamp', 'IfcRampFlight', 'IfcRoof',
#                  'IfcSlab', 'IfcStair', 'IfcStairFlight', 'IfcWall', 'IfcWallStandardCase',
#                  'IfcFurnishingElement', 'IfcBuilding', 'IfcSite', 'IfcSpace']

# # for office:
# element_types = ['IfcCovering', 'IfcDoor', 'IfcMember', 'IfcRailing', 'IfcSlab',
#                  'IfcStair', 'IfcStairFlight', 'IfcWallStandardCase', 'IfcWindow',
#                  'IfcFlowTerminal', 'IfcOpeningElement', 'IfcFurnishingElement',
#                  'IfcBuilding', 'IfcBuildingStorey', 'IfcSite', 'IfcSpace']

# kentood
# ['IfcBeam', 'IfcBuildingElementProxy', 'IfcColumn', 'IfcCovering', 'IfcCurtainWall', 'IfcDoor', 'IfcMember', 'IfcPlate', 'IfcRailing',
#  'IfcRoof', 'IfcSlab', 'IfcStair', 'IfcStairFlight', 'IfcWall', 'IfcWallStandardCase', 'IfcWindow', 'IfcFlowFitting', 'IfcFlowSegment', 'IfcFlowTerminal',
#  'IfcOpeningElement', 'IfcFurnishingElement', 'IfcTransportElement', 'IfcDistributionPort', 'IfcBuilding', 'IfcBuildingStorey', 'IfcSite', 'IfcSpace'] 9214


def get_geom(product):
    try:
        shape = ifcopenshell.geom.create_shape(settings, product)
        geo = shape.geometry
        return {"product_name": product.is_a(),
                "guid": product.GlobalId,
                "vertices": geo.verts,
                "faces": geo.faces}
    except Exception as e:
        return {"product_name": product.is_a(), "guid": product.GlobalId, "vertices": [], "faces": []}


def get_unique_elements():
    unique_elements = []
    count = 0
    for product in model.by_type("IfcProduct"):
        count += 1
        x = str(product.is_a())
        if x not in unique_elements:
            unique_elements.append(x)
    return unique_elements, count


# def get_element_types():
#     return {"output": element_types}


def get_guids():
    unique_elements, count = get_unique_elements()
    return {"guids": unique_elements, "count": count}


def get_geometry_from_guid(guid: str):
    result = {}
    try:
        for prod in model.by_type("IfcProduct"):
            if prod.GlobalId == guid:
                res = get_geom(prod)
                res2 = {"product_name": res["product_name"],
                        "guid": res["guid"],
                        "vertices": res["vertices"],
                        "faces": res["faces"]}
                result.update(res2)
    except:
        pass
    return result


def get_properties_from_guid(guid: str):
    psets = {}
    try:
        product = model.by_guid(guid)
        element_type = product.is_a()

        all_prop_sets = []
        property_sets = ifcopenshell.util.element.get_psets(
            product, psets_only=True)
        for pset_name, properties in property_sets.items():
            for prop_name, prop_value in properties.items():
                x = {"Property": prop_name, "Value": prop_value}
                all_prop_sets.append(x)

        prop_sets = ifcopenshell.util.element.get_psets(product)
        for k, v in prop_sets.items():
            for k2, v2 in v.items():
                psets.update({k2: v2})
        container = ifcopenshell.util.element.get_container(product)
        psets.update({"level": container.Name})
        psets.update({"guid": guid})
        psets.update({"product_name": product.Name})
        psets.update({"element_type": element_type})
        psets.update({"element_type": element_type})
        psets.update({"all_props": all_prop_sets})
        print(psets)
    except Exception as e:
        print(f'error getting props {e}')
    return psets


def write_db():
    errors = []
    unique_elements, count = get_unique_elements()
    print(unique_elements, count)
    return

    # print(f"num of elements {count}")
    # for i, elem in enumerate(unique_elements):
    #     if (i % 100 == 0 and i > 0):
    #         print(f'num of elements processed = {i}')
    #         # result = collection.insert_many(ifc_data)
    #         # ifc_data = []
    #     try:
    #         guid = elem["guid"]
    #         result = {}
    #         res = get_geometry_from_guid(guid)
    #         res2 = get_properties_from_guid(guid)
    #         print(res2)
    #         result.update(res)
    #         result.update(res2)
    #         # ifc_data.append(result)
    #         break
    #         # print(result)
    #     except Exception as e:
    #         print(f"{i} error {guid}\n{e}")
    #         errors.append(guid)
    #         break


def read_db():
    items = []
    cursor = _collection.find({"element_type": "IfcWall"})
    for item in cursor:
        item["_id"] = str(item["id"])
        items.append(item)
    return items


a = time.perf_counter()
write_db()
b = time.perf_counter()
print(f"time taken = {b-a} seconds")
