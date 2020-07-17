import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createPaginationContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { compose } from 'ramda';
import { Link } from 'react-router-dom';
import inject18n from '../../../../components/i18n';
import ItemIcon from '../../../../components/ItemIcon';
import StixCoreRelationshipCreationFromEntity from './StixCoreRelationshipCreationFromEntity';
import StixCoreRelationshipPopover from './StixCoreRelationshipPopover';
import { resolveLink } from '../../../../utils/Entity';

const styles = (theme) => ({
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '-4px 0 0 0',
    padding: 0,
    borderRadius: 6,
  },
  list: {
    padding: 0,
  },
  avatar: {
    width: 24,
    height: 24,
    backgroundColor: theme.palette.primary.main,
  },
  avatarDisabled: {
    width: 24,
    height: 24,
  },
  placeholder: {
    display: 'inline-block',
    height: '1em',
    backgroundColor: theme.palette.grey[700],
  },
});

class StixCoreRelationshipStixCoreRelationshipsLinesContainer extends Component {
  render() {
    const {
      t, classes, entityId, data, paginationOptions,
    } = this.props;
    return (
      <div style={{ height: '100%' }}>
        <Typography variant="h4" gutterBottom={true} style={{ float: 'left' }}>
          {t('Linked entities')}
        </Typography>
        <StixCoreRelationshipCreationFromEntity
          entityId={entityId}
          isFromRelation={true}
          paddingRight={true}
          variant="inLine"
          paginationOptions={paginationOptions}
        />
        <div className="clearfix" />
        <Paper classes={{ root: classes.paper }} elevation={2}>
          <List classes={{ root: classes.list }}>
            {data.stixCoreRelationships.edges.map(
              (stixCoreRelationshipEdge) => {
                const stixCoreRelationship = stixCoreRelationshipEdge.node;
                const link = `${resolveLink(
                  stixCoreRelationship.to.parent_types.includes(
                    'Stix-Observable',
                  )
                    ? 'observable'
                    : stixCoreRelationship.to.entity_type,
                )}/${stixCoreRelationship.to.id}`;
                return (
                  <ListItem
                    key={stixCoreRelationship.id}
                    dense={true}
                    divider={true}
                    button={true}
                    component={Link}
                    to={link}
                  >
                    <ListItemIcon>
                      <ItemIcon type={stixCoreRelationship.to.entity_type} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        stixCoreRelationship.to.parent_types.includes(
                          'Stix-Observable',
                        )
                          ? stixCoreRelationship.to.observable_value
                          : stixCoreRelationship.to.name
                      }
                      secondary={
                        stixCoreRelationship.to.parent_types.includes(
                          'Stix-Observable',
                        )
                          ? t(
                            `observable_${stixCoreRelationship.to.entity_type}`,
                          )
                          : t(`entity_${stixCoreRelationship.to.entity_type}`)
                      }
                    />
                    <ListItemSecondaryAction>
                      <StixCoreRelationshipPopover
                        stixCoreRelationshipId={stixCoreRelationship.id}
                        paginationOptions={paginationOptions}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              },
            )}
          </List>
        </Paper>
      </div>
    );
  }
}

StixCoreRelationshipStixCoreRelationshipsLinesContainer.propTypes = {
  entityId: PropTypes.string,
  paginationOptions: PropTypes.object,
  data: PropTypes.object,
  limit: PropTypes.number,
  classes: PropTypes.object,
  t: PropTypes.func,
  fld: PropTypes.func,
};

export const stixCoreRelationshipStixCoreRelationshipsLinesQuery = graphql`
  query StixCoreRelationshipStixCoreRelationshipsLinesQuery(
    $fromId: String
    $relationType: String
    $count: Int!
    $cursor: ID
    $orderBy: StixCoreRelationshipsOrdering
    $orderMode: OrderingMode
  ) {
    ...StixCoreRelationshipStixCoreRelationshipsLines_data
      @arguments(
        fromId: $fromId
        relationType: $relationType
        count: $count
        cursor: $cursor
        orderBy: $orderBy
        orderMode: $orderMode
      )
  }
`;

const StixCoreRelationshipStixCoreRelationshipsLines = createPaginationContainer(
  StixCoreRelationshipStixCoreRelationshipsLinesContainer,
  {
    data: graphql`
      fragment StixCoreRelationshipStixCoreRelationshipsLines_data on Query
        @argumentDefinitions(
          fromId: { type: "String" }
          relationType: { type: "String" }
          count: { type: "Int", defaultValue: 25 }
          cursor: { type: "ID" }
          orderBy: {
            type: "StixCoreRelationshipsOrdering"
            defaultValue: "start_time"
          }
          orderMode: { type: "OrderingMode", defaultValue: "asc" }
        ) {
        stixCoreRelationships(
          fromId: $fromId
          relationType: $relationType
          first: $count
          after: $cursor
          orderBy: $orderBy
          orderMode: $orderMode
        ) @connection(key: "Pagination_stixCoreRelationships") {
          edges {
            node {
              id
              to {
                ... on StixDomainObject {
                  id
                  name
                  entity_type
                  parent_types
                }
                ... on StixCyberObservable {
                  id
                  entity_type
                  parent_types
                  observable_value
                }
              }
            }
          }
          pageInfo {
            endCursor
            hasNextPage
            globalCount
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.data && props.data.stixCoreRelationships;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      return {
        fromId: fragmentVariables.fromId,
        relationType: fragmentVariables.relationType,
        count,
        cursor,
        orderBy: fragmentVariables.orderBy,
        orderMode: fragmentVariables.orderMode,
      };
    },
    query: stixCoreRelationshipStixCoreRelationshipsLinesQuery,
  },
);

export default compose(
  inject18n,
  withStyles(styles),
)(StixCoreRelationshipStixCoreRelationshipsLines);
