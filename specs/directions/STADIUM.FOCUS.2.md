# Stadiums Refinement

## Generator

- Create a base stadium generator in core/ that generates the features common to all stadiums, like location, name, etc.
- Extend that generator specifically for baseball in products/baseball that uses the common features of core and extends
  with baseball features.
    - Accept a CLI parameter use `config` to determine how many stadiums to create. Defaults to 125
- Generate the JSON for the stadiums in products/baseball/assets/stadiums
- Generate images in products/baseball/assets/stadiums
- Create a makefile recipe to generate new stadiums and pass the parameter for the number of stadiums to create.
- When generation is complete, it should delete any orphaned `/svg` files
- The generator should re-use any existing stadiums to meet the number to generate.